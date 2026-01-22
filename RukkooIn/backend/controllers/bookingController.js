import Property from '../models/Property.js';
import RoomType from '../models/RoomType.js';
import Booking from '../models/Booking.js';
import Offer from '../models/Offer.js';
import PlatformSettings from '../models/PlatformSettings.js';
import AvailabilityLedger from '../models/AvailabilityLedger.js';
import Wallet from '../models/Wallet.js';
import Transaction from '../models/Transaction.js';
import Razorpay from 'razorpay';
import PaymentConfig from '../config/payment.config.js';
import mongoose from 'mongoose';
import emailService from '../services/emailService.js';
import notificationService from '../services/notificationService.js';
import User from '../models/User.js';

// Helper: Trigger Notifications
const triggerBookingNotifications = async (booking) => {
  try {
    const fullBooking = await Booking.findById(booking._id)
      .populate('userId')
      .populate('propertyId');

    if (!fullBooking) return;

    const user = fullBooking.userId;
    const property = fullBooking.propertyId;

    // 1. User Email
    if (user && user.email) {
      emailService.sendBookingConfirmationEmail(user, fullBooking).catch(err => console.error('Email trigger failed:', err));
    }

    // 2. User Push
    notificationService.sendToUser(user._id, {
      title: 'Booking Confirmed!',
      body: `You are going to ${property ? property.propertyName : 'Hotel'}.`
    }, { type: 'booking', bookingId: fullBooking._id }, 'user').catch(err => console.error('User Push failed:', err));

    // 3. Partner Notifications
    if (property && property.partnerId) {
      // Push
      notificationService.sendToUser(property.partnerId, {
        title: 'New Booking Alert!',
        body: `1 Night, ${fullBooking.guests.adults} Guests. Check App.`
      }, { type: 'new_booking', bookingId: fullBooking._id }, 'partner').catch(err => console.error('Partner Push failed:', err));
    }

  } catch (err) {
    console.error('Trigger Notification Error:', err);
  }
};

export const createBooking = async (req, res) => {
  try {
    const { propertyId, roomTypeId, checkInDate, checkOutDate, guests, totalAmount, paymentMethod, paymentDetails } = req.body;

    // Basic Validation
    if (!propertyId || !roomTypeId || !checkInDate || !checkOutDate) {
      return res.status(400).json({ message: 'Missing required booking details' });
    }

    const bookingId = `BK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Create Pending Booking
    const booking = new Booking({
      bookingId,
      userId: req.user._id,
      propertyId,
      roomTypeId,
      checkInDate,
      checkOutDate,
      guests,
      totalAmount,
      paymentMethod, // 'wallet', 'online', 'pay_at_hotel'
      bookingStatus: 'confirmed', // Assuming instant confirm for demo, usually 'pending' if online payment not verified
      paymentStatus: paymentMethod === 'pay_at_hotel' ? 'pending' : 'paid' // Simplified
    });

    // Handle Wallet Payment
    if (paymentMethod === 'wallet') {
      const wallet = await Wallet.findOne({ userId: req.user._id });
      if (!wallet || wallet.balance < totalAmount) {
        return res.status(400).json({ message: 'Insufficient wallet balance' });
      }
      wallet.balance -= totalAmount;
      await wallet.save();

      await Transaction.create({
        walletId: wallet._id,
        userId: req.user._id,
        type: 'debit',
        category: 'booking',
        amount: totalAmount,
        description: `Booking #${bookingId}`,
        status: 'completed'
      });

      booking.paymentStatus = 'paid';
    }
    // Handle Online Payment (Razorpay Order Creation usually happens separately, verified here)
    else if (paymentMethod === 'online') {
      // Assuming paymentDetails contains success info verified middleware or trusted
      if (paymentDetails && paymentDetails.paymentId) {
        booking.paymentStatus = 'paid';
        booking.transactionId = paymentDetails.paymentId;
      } else {
        booking.bookingStatus = 'pending_payment';
        booking.paymentStatus = 'pending';
      }
    }

    await booking.save();

    // Update Inventory (Simplified - Block Room)
    await AvailabilityLedger.create({
      propertyId,
      roomTypeId,
      date: new Date(checkInDate),
      totalRooms: 1, // multiple entries for date range? Simplified for now
      bookedRooms: 1,
      referenceId: booking._id,
      type: 'booking'
    });

    // Trigger Notifications
    triggerBookingNotifications(booking);

    res.status(201).json({ success: true, booking });
  } catch (error) {
    console.error('Create Booking Error:', error);
    res.status(500).json({ message: 'Server error creating booking' });
  }
};

export const getMyBookings = async (req, res) => {
  try {
    const { type } = req.query; // 'upcoming', 'completed', 'cancelled'
    const query = { userId: req.user._id };

    if (type === 'upcoming') {
      query.bookingStatus = { $in: ['confirmed', 'pending_payment'] };
      // query.checkInDate = { $gte: new Date() }; // Optional strict check
    } else if (type === 'completed') {
      query.bookingStatus = { $in: ['completed', 'checked_out'] };
    } else if (type === 'cancelled') {
      query.bookingStatus = 'cancelled';
    }

    const bookings = await Booking.find(query)
      .populate('propertyId', 'propertyName address location coverImage')
      .populate('roomTypeId', 'name')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (e) {
    console.error('Get My Bookings Error:', e);
    res.status(500).json({ message: e.message });
  }
};

export const getPartnerBookings = async (req, res) => {
  try {
    const { status } = req.query;
    // Find properties owned by partner
    const properties = await Property.find({ partnerId: req.user._id }).select('_id');
    const propertyIds = properties.map(p => p._id);

    const query = { propertyId: { $in: propertyIds } };
    if (status && status !== 'all') {
      query.bookingStatus = status;
    }

    const bookings = await Booking.find(query)
      .populate('userId', 'name email phone')
      .populate('propertyId', 'propertyName')
      .populate('roomTypeId', 'name')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (e) {
    console.error('Get Partner Bookings Error:', e);
    res.status(500).json({ message: e.message });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Allow user to cancel or admin/partner
    if (booking.userId.toString() !== req.user._id.toString()) {
      // Logic for partner/admin override
    }

    booking.bookingStatus = 'cancelled';
    booking.cancellationReason = req.body.reason || 'User cancelled';
    await booking.save();

    // Trigger Cancellation Notifications
    const fullBooking = await Booking.findById(booking._id).populate('userId').populate('propertyId');
    if (fullBooking) {
      if (fullBooking.userId && fullBooking.userId.email) {
        emailService.sendBookingCancellationEmail(fullBooking.userId, fullBooking, booking.paymentStatus === 'refunded' ? booking.totalAmount : 0)
          .catch(e => console.error('Cancel Email failed', e));
      }

      if (fullBooking.propertyId && fullBooking.propertyId.partnerId) {
        notificationService.sendToUser(fullBooking.propertyId.partnerId, {
          title: 'Booking Cancelled',
          body: `Booking #${fullBooking.bookingId} Cancelled by User. Inventory released.`
        }, { type: 'booking_cancelled', bookingId: booking._id }, 'partner').catch(e => console.error('Cancel Push failed', e));
      }
    }

    // Release Inventory
    await AvailabilityLedger.deleteMany({ referenceId: booking._id });

    res.json({ success: true, message: 'Booking cancelled successfully', booking });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Get Specific Booking Details for Partner
export const getPartnerBookingDetail = async (req, res) => {
  try {
    const { id } = req.params;

    // Find Booking and Populate
    const booking = await Booking.findById(id)
      .populate({
        path: 'propertyId',
        populate: { path: 'partnerId' } // Need to check partner ID
      })
      .populate('userId', 'name email phone')
      .populate('roomTypeId');

    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Verify Ownership (Partner must own the property)
    if (booking.propertyId.partnerId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this booking' });
    }

    res.json(booking);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Mark Booking as Paid (Pay at Hotel)
export const markBookingAsPaid = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id).populate('propertyId');

    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Auth Check
    if (booking.propertyId.partnerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (booking.paymentStatus === 'paid') {
      return res.status(200).json({ success: true, message: 'Booking is already marked as paid.', booking });
    }

    // Logic for "Pay at Hotel"
    booking.paymentStatus = 'paid';
    await booking.save();

    // Helper to calc commission would be good here
    const commission = booking.totalAmount * 0.10; // Example 10%
    // Debit logic...

    // ... (Keeping simple for rescue)

    res.json({ success: true, message: 'Marked as Paid', booking });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Mark as No Show
export const markBookingNoShow = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id).populate('propertyId');

    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Auth Check
    if (booking.propertyId.partnerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (['cancelled', 'completed', 'no_show'].includes(booking.bookingStatus)) {
      return res.status(400).json({ message: `Cannot mark as No Show. Status is ${booking.bookingStatus}` });
    }

    // 1. Update Status
    booking.bookingStatus = 'no_show';
    booking.cancellationReason = 'Guest No Show';

    // Self-healing: Ensure bookingId exists
    if (!booking.bookingId) {
      booking.bookingId = `BK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }

    await booking.save();

    // 2. Release Inventory
    await AvailabilityLedger.deleteMany({ referenceId: booking._id });

    res.json({ success: true, message: 'Marked as No Show', booking });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};