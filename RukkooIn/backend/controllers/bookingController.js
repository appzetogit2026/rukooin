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
    if (user) {
      notificationService.sendToUser(user._id, {
        title: 'Booking Confirmed!',
        body: `You are going to ${property ? property.propertyName : 'Hotel'}.`
      }, { type: 'booking', bookingId: fullBooking._id }, 'user').catch(err => console.error('User Push failed:', err));
    }

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
    const {
      propertyId,
      roomTypeId,
      checkInDate,
      checkOutDate,
      guests,
      totalAmount,
      paymentMethod,
      paymentDetails,
      bookingUnit,
      couponCode,
      useWallet,
      walletDeduction
    } = req.body;

    // Basic Validation
    if (!propertyId || !roomTypeId || !checkInDate || !checkOutDate) {
      return res.status(400).json({ message: 'Missing required booking details' });
    }

    // Fetch Property and RoomType to get required data
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const roomType = await RoomType.findById(roomTypeId);
    if (!roomType) {
      return res.status(404).json({ message: 'Room type not found' });
    }

    // Calculate total nights
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const totalNights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

    if (totalNights <= 0) {
      return res.status(400).json({ message: 'Invalid check-in/check-out dates' });
    }

    // Get price per night from room type
    const pricePerNight = roomType.pricePerNight || 0;
    const baseAmount = pricePerNight * totalNights;

    // Calculate extra charges if any
    const extraAdults = guests.extraAdults || 0;
    const extraChildren = guests.extraChildren || 0;
    const extraAdultPrice = (roomType.extraAdultPrice || 0) * extraAdults * totalNights;
    const extraChildPrice = (roomType.extraChildPrice || 0) * extraChildren * totalNights;
    const extraCharges = extraAdultPrice + extraChildPrice;

    // --- FINANCIAL CALCULATIONS (Commission, Tax, Payout) ---
    // Fetch Dynamic Settings
    const settings = await PlatformSettings.getSettings();
    const gstRate = settings.taxRate || 12;
    const commissionRate = settings.defaultCommission || 10;

    const commissionableAmount = baseAmount + extraCharges;

    // 1. Calculate Tax (GST) based on Commissionable Amount (Base + Extra)
    const taxes = Math.round((commissionableAmount * gstRate) / 100);

    // 2. Calculate Commission on the Pre-Tax Amount
    let adminCommission = Math.round((commissionableAmount * commissionRate) / 100);

    // Apply Minimum Commission (Still hardcoded as a safety fallback or stored in config)
    if (adminCommission < PaymentConfig.minCommission) {
      adminCommission = PaymentConfig.minCommission;
    }

    // 3. Calculate Partner Payout
    // Payout = Total Amount Collected - Taxes (Remitted to Admin) - Commission (Kept by Admin)
    const partnerPayout = Math.floor(totalAmount - taxes - adminCommission);

    const bookingId = `BK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Create Pending Booking with all required fields
    const booking = new Booking({
      bookingId,
      userId: req.user._id,
      propertyId,
      propertyType: property.propertyType.toLowerCase(), // Required field
      roomTypeId,
      bookingUnit: bookingUnit || 'room', // Required field
      checkInDate,
      checkOutDate,
      totalNights, // Required field
      guests: {
        adults: guests.adults || 1,
        children: guests.children || 0
      },
      pricePerNight, // Required field
      baseAmount, // Required field
      extraAdultPrice,
      extraChildPrice,
      extraCharges,
      taxes,
      adminCommission,
      partnerPayout,
      couponCode: couponCode || undefined,
      totalAmount,
      paymentMethod, // 'wallet', 'razorpay', 'pay_at_hotel'
      bookingStatus: 'confirmed', // Assuming instant confirm for demo
      paymentStatus: paymentMethod === 'pay_at_hotel' ? 'pending' : 'paid' // Simplified
    });

    // Handle Wallet Payment
    if (paymentMethod === 'wallet' || (useWallet && walletDeduction > 0)) {
      const wallet = await Wallet.findOne({ userId: req.user._id });
      const deductionAmount = walletDeduction || totalAmount;

      if (!wallet || wallet.balance < deductionAmount) {
        return res.status(400).json({ message: 'Insufficient wallet balance' });
      }

      wallet.balance -= deductionAmount;
      await wallet.save();

      await Transaction.create({
        walletId: wallet._id,
        userId: req.user._id,
        type: 'debit',
        category: 'booking',
        amount: deductionAmount,
        description: `Booking #${bookingId}`,
        status: 'completed'
      });

      if (paymentMethod === 'wallet') {
        booking.paymentStatus = 'paid';
      }
    }

    // Handle Online Payment (Razorpay)
    let razorpayOrder = null;
    if (paymentMethod === 'razorpay' || paymentMethod === 'online') {
      if (paymentDetails && paymentDetails.paymentId) {
        booking.paymentStatus = 'paid';
        booking.paymentId = paymentDetails.paymentId;
      } else {
        booking.bookingStatus = 'pending';
        booking.paymentStatus = 'pending';

        // Calculate amount to pay after wallet deduction
        const amountToPay = totalAmount - (useWallet ? (walletDeduction || 0) : 0);

        if (amountToPay > 0) {
          try {
            const instance = new Razorpay({
              key_id: PaymentConfig.razorpayKeyId,
              key_secret: PaymentConfig.razorpayKeySecret,
            });

            const options = {
              amount: Math.round(amountToPay * 100), // amount in paisa
              currency: PaymentConfig.currency || "INR",
              receipt: bookingId,
              notes: {
                bookingId: booking._id.toString(),
                userId: req.user._id.toString(),
                propertyId: propertyId.toString(),
                roomTypeId: roomTypeId.toString(),
                checkInDate: checkInDate,
                checkOutDate: checkOutDate,
                bookingUnit: bookingUnit || 'room',
                totalNights: totalNights.toString(),
                guests: JSON.stringify(guests),
                pricePerNight: pricePerNight.toString(),
                baseAmount: baseAmount.toString(),
                extraCharges: extraCharges.toString(),
                taxes: taxes.toString(),
                discount: (0).toString(), // Placeholder if discount logic expands
                couponCode: couponCode || "",
                adminCommission: adminCommission.toString(),
                partnerPayout: partnerPayout.toString(),
                totalAmount: totalAmount.toString(),
                walletUsedAmount: (useWallet ? (walletDeduction || 0) : 0).toString(),
                type: 'booking_init' // Flag to identify this as a booking initiation
              }
            };

            razorpayOrder = await instance.orders.create(options);
            // Optionally store order ID in booking if schema supports it
            // booking.razorpayOrderId = razorpayOrder.id; 
          } catch (error) {
            console.error("Razorpay Order Creation Failed:", error);
            return res.status(500).json({ message: "Failed to initiate payment gateway" });
          }
        } else {
          // Fully paid by wallet
          booking.paymentStatus = 'paid';
          booking.bookingStatus = 'confirmed';
        }
      }
    }

    await booking.save();

    // Update Inventory (Block Room for the stay duration)
    await AvailabilityLedger.create({
      propertyId,
      roomTypeId,
      inventoryType: booking.bookingUnit || 'room',
      source: 'platform',
      referenceId: booking._id,
      startDate: new Date(checkInDate),
      endDate: new Date(checkOutDate),
      units: 1,
      createdBy: 'system'
    });

    // Trigger Notifications
    triggerBookingNotifications(booking);

    res.status(201).json({
      success: true,
      booking,
      paymentRequired: !!razorpayOrder,
      order: razorpayOrder,
      key: PaymentConfig.razorpayKeyId
    });
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