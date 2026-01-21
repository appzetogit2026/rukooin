import Property from '../models/Property.js';
import RoomType from '../models/RoomType.js';
import Booking from '../models/Booking.js';
import Offer from '../models/Offer.js';
import PlatformSettings from '../models/PlatformSettings.js';
import AvailabilityLedger from '../models/AvailabilityLedger.js';
import notificationService from '../services/notificationService.js';
import smsService from '../utils/smsService.js';

const nightsBetween = (checkInDate, checkOutDate) => {
  const a = new Date(checkInDate);
  const b = new Date(checkOutDate);
  const diff = Math.ceil(Math.abs(b - a) / (1000 * 60 * 60 * 24));
  return Math.max(1, diff);
};

export const createBooking = async (req, res) => {
  try {
    const settings = await PlatformSettings.getSettings();
    if (!settings.platformOpen) return res.status(423).json({ message: settings.bookingDisabledMessage || 'Bookings are temporarily disabled.' });
    const { propertyId, roomTypeId, checkInDate, checkOutDate, guests, couponCode } = req.body;
    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ message: 'Property not found' });
    const nights = nightsBetween(checkInDate, checkOutDate);
    if (!roomTypeId) return res.status(400).json({ message: 'roomTypeId required' });
    const rt = await RoomType.findById(roomTypeId);
    if (!rt || rt.propertyId.toString() !== propertyId) return res.status(400).json({ message: 'Invalid room type' });

    if (property.propertyType === 'resort') {
      const baseAdults = Number(guests?.adults || 1);
      const baseChildren = Number(guests?.children || 0);
      const maxAdults = Number(rt.maxAdults || 0);
      const maxChildren = Number(rt.maxChildren || 0);
      if (baseAdults > maxAdults) {
        return res.status(400).json({ message: 'Max adults exceeded for selected room type' });
      }
      if (baseAdults + baseChildren > maxAdults + maxChildren) {
        return res.status(400).json({ message: 'Max guests exceeded for selected room type' });
      }
    }

    let pricePerNight = rt.pricePerNight;
    let extraAdultPrice = rt.extraAdultPrice || 0;
    let extraChildPrice = rt.extraChildPrice || 0;
    const bookingUnit = rt.inventoryType;
    const baseAmount = pricePerNight * nights;
    const extraAdults = Math.max(0, Number(guests?.extraAdults || 0));
    const extraChildren = Math.max(0, Number(guests?.extraChildren || 0));
    const extraCharges = (extraAdults * extraAdultPrice + extraChildren * extraChildPrice) * nights;
    const taxes = Number(req.body.taxes || 0);
    let discount = 0;
    let appliedOffer = null;
    const preDiscountTotal = baseAmount + extraCharges + taxes;
    if (couponCode) {
      const offer = await Offer.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (!offer) return res.status(400).json({ message: 'Invalid coupon code' });
      const now = new Date();
      if (offer.startDate && offer.startDate > now) return res.status(400).json({ message: 'Coupon not active yet' });
      if (offer.endDate && offer.endDate < now) return res.status(400).json({ message: 'Coupon expired' });
      if (preDiscountTotal < offer.minBookingAmount) return res.status(400).json({ message: `Minimum booking amount should be ₹${offer.minBookingAmount}` });
      if (offer.usageLimit && offer.usageCount >= offer.usageLimit) return res.status(400).json({ message: 'Coupon limit reached' });
      if (offer.discountType === 'percentage') {
        discount = Math.floor((preDiscountTotal * offer.discountValue) / 100);
        if (offer.maxDiscount && discount > offer.maxDiscount) discount = offer.maxDiscount;
      } else {
        discount = Math.floor(offer.discountValue);
      }
      appliedOffer = offer;
    }
    const totalAmount = Math.max(0, preDiscountTotal - discount);
    const booking = await Booking.create({
      userId: req.user._id,
      propertyId,
      propertyType: property.propertyType,
      roomTypeId: roomTypeId,
      bookingUnit,
      checkInDate,
      checkOutDate,
      totalNights: nights,
      guests: { adults: Number(guests?.adults || 1), children: Number(guests?.children || 0) },
      pricePerNight,
      baseAmount,
      extraAdultPrice,
      extraChildPrice,
      extraCharges,
      taxes,
      discount,
      totalAmount,
      paymentStatus: 'pending',
      bookingStatus: 'pending',
      paymentMethod: undefined
    });

    await AvailabilityLedger.create({
      propertyId,
      roomTypeId,
      inventoryType: bookingUnit,
      source: 'platform',
      referenceId: booking._id,
      startDate: new Date(checkInDate),
      endDate: new Date(checkOutDate),
      units: 1,
      createdBy: 'system'
    });
    if (appliedOffer) {
      await Offer.findByIdAndUpdate(appliedOffer._id, { $inc: { usageCount: 1 } });
    }

    // Assuming these variables are defined elsewhere or will be defined in a preceding block
    // For the purpose of this insertion, I'm adding placeholder definitions if they don't exist.
    // In a real scenario, these would come from payment processing or commission calculations.
    const partnerPayout = 0; // Placeholder
    const adminCommission = 0; // Placeholder
    const taxAmount = 0; // Placeholder
    const bookingId = booking._id.toString(); // Use the actual booking ID

    // 3. Credit Partner Wallet
    if (partnerPayout > 0 && property.partnerId) {
      let partnerWallet = await Wallet.findOne({ partnerId: property.partnerId, role: 'partner' });
      if (!partnerWallet) partnerWallet = await Wallet.create({ partnerId: property.partnerId, role: 'partner', balance: 0 });

      partnerWallet.balance += partnerPayout;
      partnerWallet.totalEarnings += partnerPayout;
      await partnerWallet.save();

      await Transaction.create({
        walletId: partnerWallet._id,
        partnerId: property.partnerId,
        type: 'credit',
        category: 'booking_payment',
        amount: partnerPayout,
        balanceAfter: partnerWallet.balance,
        description: `Payment for Booking #${bookingId}`,
        reference: bookingId,
        status: 'completed',
        metadata: { bookingId: booking._id.toString() }
      });
    }

    // 4. Credit Admin Wallet
    const totalAdminCredit = adminCommission + taxAmount;
    if (totalAdminCredit > 0) {
      const AdminUser = mongoose.model('User'); // Assuming mongoose is imported and User model exists
      const adminUser = await AdminUser.findOne({ role: { $in: ['admin', 'superadmin'] } });
      if (adminUser) {
        let adminWallet = await Wallet.findOne({ role: 'admin' }); // Assuming Wallet model exists
        if (!adminWallet) adminWallet = await Wallet.create({ partnerId: adminUser._id, role: 'admin', balance: 0 });

        adminWallet.balance += totalAdminCredit;
        adminWallet.totalEarnings += totalAdminCredit;
        await adminWallet.save();

        await Transaction.create({
          walletId: adminWallet._id,
          partnerId: adminUser._id,
          type: 'credit',
          category: 'commission_tax',
          amount: totalAdminCredit,
          balanceAfter: adminWallet.balance,
          description: `Commission (₹${adminCommission}) & Tax (₹${taxAmount}) for Booking #${bookingId}`,
          reference: bookingId,
          status: 'completed',
          metadata: { bookingId: booking._id.toString() }
        });
      }
    }

    const populatedBooking = await Booking.findById(booking._id)
      .populate('propertyId', 'name address images coverImage type checkInTime checkOutTime')
      .populate('roomTypeId', 'name type inventoryType')
      .populate('userId', 'name email phone');

    // --- NOTIFICATION HOOK: BOOKING CONFIRMED (PAY AT HOTEL) ---
    try {
      // 1. Notify User (Email + Push)
      const userMsg = `Booking Confirmed! You are going to ${property.name}. ID: ${bookingId}. Please pay at hotel.`;
      await notificationService.sendToUser(req.user._id, {
        title: 'Booking Confirmed 🏨',
        body: userMsg
      }, {
        sendEmail: true,
        emailHtml: `
          <h3>Booking Confirmation (Pay At Hotel)</h3>
          <p>Your booking #${bookingId} is confirmed.</p>
          <p><strong>Property:</strong> ${property.name}</p>
          <p><strong>Check-in:</strong> ${new Date(checkInDate).toDateString()}</p>
          <p><strong>Check-out:</strong> ${new Date(checkOutDate).toDateString()}</p>
          <p><strong>Total Amount:</strong> ₹${totalAmount}</p>
          <p><strong>Amount Paid:</strong> ₹${walletUsedAmount || 0}</p>
          <p><strong>Pay at Property:</strong> ₹${finalPayable}</p>
        `,
        type: 'booking_confirmed',
        data: { bookingId: booking._id }
      });

      // 2. Notify Partner (Push + SMS)
      if (property.partnerId) {
        const partnerMsg = `New Booking (Pay At Hotel)! Booking #${bookingId} for ${nights} Night(s). Collect ₹${finalPayable}.`;

        // Push
        await notificationService.sendToUser(property.partnerId, {
          title: 'New Booking Recieved 💰',
          body: partnerMsg
        }, {
          type: 'partner_new_booking',
          bookingId: booking._id
        }, 'partner');

        // SMS
        const PartnerUser = mongoose.model('User');
        const partner = await PartnerUser.findById(property.partnerId);
        if (partner && partner.phone) {
          smsService.sendMessage(partner.phone, partnerMsg).catch(e => console.log('Partner SMS Failed (PAH)', e.message));
        }
      }
    } catch (notifErr) {
      console.error('Notification Error (PAH):', notifErr.message);
    }
    // -----------------------------------------------------------

    // --- NOTIFICATION HOOK: BOOKING CONFIRMED (WALLET) ---
    try {
      // 1. Notify User (Email + Push)
      const userMsg = `Booking Confirmed! You are going to ${property.name}. ID: ${bookingId}`; // Changed property.propertyName to property.name
      await notificationService.sendToUser(req.user._id, {
        title: 'Booking Confirmed 🏨',
        body: userMsg
      }, {
        sendEmail: true,
        emailHtml: `
          <h3>Booking Confirmation</h3>
          <p>Your booking #${bookingId} is confirmed.</p>
          <p><strong>Property:</strong> ${property.name}</p>
          <p><strong>Check-in:</strong> ${new Date(checkInDate).toDateString()}</p>
          <p><strong>Check-out:</strong> ${new Date(checkOutDate).toDateString()}</p>
          <p><strong>Amount Paid:</strong> ₹${totalAmount}</p>
        `,
        type: 'booking_confirmed',
        data: { bookingId: booking._id }
      });

      // 2. Notify Partner (Push + SMS)
      if (property.partnerId) {
        const partnerMsg = `New Booking Alert! Booking #${bookingId} for ${nights} Night(s). Check App for details.`;

        // Push
        await notificationService.sendToUser(property.partnerId, {
          title: 'New Booking Recieved 💰',
          body: partnerMsg
        }, {
          type: 'partner_new_booking',
          bookingId: booking._id
        }, 'partner');

        // SMS (Need Partner Phone)
        const PartnerUser = mongoose.model('User'); // Assuming mongoose is imported and User model exists
        const partner = await PartnerUser.findById(property.partnerId);
        if (partner && partner.phone) {
          smsService.sendMessage(partner.phone, partnerMsg).catch(e => console.log('Partner SMS Failed', e.message));
        }
      }
    } catch (notifErr) {
      console.error('Notification Error:', notifErr.message);
    }
    // -----------------------------------------------------

    res.status(201).json({ success: true, booking: populatedBooking });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { cancellationReason } = req.body;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    if (booking.bookingStatus === 'cancelled' || booking.bookingStatus === 'completed') {
      return res.status(400).json({ message: `Booking is already ${booking.bookingStatus}` });
    }

    // Implement cancellation logic here
    // For example, update booking status, handle refunds, release inventory

    booking.bookingStatus = 'cancelled';
    booking.cancellationReason = cancellationReason;
    // Example: If payment was made, set paymentStatus to 'refunded' or 'pending_refund'
    if (booking.paymentStatus === 'paid') {
      booking.paymentStatus = 'refunded'; // Or 'pending_refund' based on your system
      // Trigger refund process here
    }
    await booking.save();

    // Release inventory
    await AvailabilityLedger.create({
      propertyId: booking.propertyId,
      roomTypeId: booking.roomTypeId,
      inventoryType: booking.bookingUnit,
      source: 'cancellation',
      referenceId: booking._id,
      startDate: booking.checkInDate,
      endDate: booking.checkOutDate,
      units: -1, // Negative units to release inventory
      createdBy: 'system'
    });

    // --- NOTIFICATION HOOK: BOOKING CANCELLED ---
    try {
      // 1. Notify User (Email)
      const userMsg = `Booking #${booking.bookingId} Cancelled. Refund Amount: ₹${booking.paymentStatus === 'refunded' || booking.paymentStatus === 'paid' ? booking.totalAmount : 0}`;
      await notificationService.sendToUser(booking.userId, {
        title: 'Booking Cancelled ❌',
        body: userMsg
      }, {
        sendEmail: true,
        emailHtml: `
          <h3>Booking Cancellation</h3>
          <p>Your booking #${booking.bookingId} has been cancelled.</p>
          <p><strong>Reason:</strong> ${booking.cancellationReason}</p>
          <p><strong>Refund Status:</strong> ${booking.paymentStatus === 'refunded' ? 'Processed to Wallet' : 'Not Applicable'}</p>
        `,
        type: 'booking_cancelled',
        data: { bookingId: booking._id }
      });

      // 2. Notify Partner (Push)
      // fetch property again to be safe or use populated if available
      const prop = await Property.findById(booking.propertyId);
      if (prop && prop.partnerId) {
        const partnerMsg = `Booking #${booking.bookingId} Cancelled by User. Inventory has been released.`;
        await notificationService.sendToUser(prop.partnerId, {
          title: 'Booking Cancelled ⚠️',
          body: partnerMsg
        }, {
          type: 'booking_cancelled_partner',
          bookingId: booking._id
        }, 'partner');
      }
    } catch (notifErr) {
      console.error('Notification Error (Cancel):', notifErr.message);
    }
    // ------------------------------------------------

    res.json({ success: true, message: 'Booking cancelled successfully', booking });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const getMyBookings = async (req, res) => {
  try {
    const list = await Booking.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(list);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const getPartnerBookings = async (req, res) => {
  try {
    const myProps = await Property.find({ partnerId: req.user._id }).select('_id');
    const ids = myProps.map(p => p._id);
    const list = await Booking.find({ propertyId: { $in: ids } }).sort({ createdAt: -1 });
    res.json(list);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
