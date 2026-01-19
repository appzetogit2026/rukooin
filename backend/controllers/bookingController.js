import Property from '../models/Property.js';
import RoomType from '../models/RoomType.js';
import Booking from '../models/Booking.js';
import Offer from '../models/Offer.js';
import PlatformSettings from '../models/PlatformSettings.js';
import AvailabilityLedger from '../models/AvailabilityLedger.js';
import Wallet from '../models/Wallet.js';
import Transaction from '../models/Transaction.js';

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

    // --- AVAILABILITY CHECK ---
    // Get total inventory for this Room Type
    const totalStock = rt.totalInventory || 0;

    // Check existing bookings in Ledger that overlap with requested dates
    // Simplified Overlap: (StartA < EndB) && (EndA > StartB)
    const requestedStart = new Date(checkInDate);
    const requestedEnd = new Date(checkOutDate);

    const existingBookings = await AvailabilityLedger.find({
      roomTypeId: roomTypeId,
      $or: [
        {
          startDate: { $lt: requestedEnd },
          endDate: { $gt: requestedStart }
        }
      ]
    });

    // We need to check day-by-day or simply check if any moment exceeds stock.
    // For rigorous check: iterate through each day of the requested stay.
    // If on ANY day, (booked_units + new_units) > totalStock, fail.

    const requestedUnits = 1; // Assuming 1 unit per booking for now

    // Helper to get array of dates between start and end
    const getDates = (start, end) => {
      const dates = [];
      let cur = new Date(start);
      while (cur < end) { // < end because checkout day is usually free
        dates.push(new Date(cur));
        cur.setDate(cur.getDate() + 1);
      }
      return dates;
    };

    const stayDates = getDates(requestedStart, requestedEnd);

    for (let date of stayDates) {
      // Count how many units are booked for THIS specific date
      let blockedCount = 0;

      existingBookings.forEach(booking => {
        const bStart = new Date(booking.startDate);
        const bEnd = new Date(booking.endDate);

        // Check if 'date' is within this booking's range [start, end)
        if (date >= bStart && date < bEnd) {
          blockedCount += booking.units;
        }
      });

      if ((blockedCount + requestedUnits) > totalStock) {
        return res.status(400).json({
          message: `No availability for ${date.toLocaleDateString('en-IN')}. All ${totalStock} units are booked.`
        });
      }
    }
    // --- END AVAILABILITY CHECK ---

    let pricePerNight = rt.pricePerNight;
    let extraAdultPrice = rt.extraAdultPrice || 0;
    let extraChildPrice = rt.extraChildPrice || 0;
    const bookingUnit = rt.inventoryType;
    const baseAmount = pricePerNight * nights;
    const extraAdults = Math.max(0, Number(guests?.extraAdults || 0));
    const extraChildren = Math.max(0, Number(guests?.extraChildren || 0));
    const extraCharges = (extraAdults * extraAdultPrice + extraChildren * extraChildPrice) * nights;

    // Financial Settings
    const taxRate = settings.taxRate || 0;
    const commissionRate = settings.defaultCommission || 0;

    const grossAmount = baseAmount + extraCharges;

    let discount = 0;
    let appliedOffer = null;

    // Validate Coupon
    if (couponCode) {
      const offer = await Offer.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (!offer) return res.status(400).json({ message: 'Invalid coupon code' });
      const now = new Date();
      if (offer.startDate && offer.startDate > now) return res.status(400).json({ message: 'Coupon not active yet' });
      // Fix: Compare against end of the 'endDate' day to allow usage on the expiry day itself
      if (offer.endDate) {
        const expiry = new Date(offer.endDate);
        expiry.setHours(23, 59, 59, 999);
        if (expiry < now) return res.status(400).json({ message: 'Coupon expired' });
      }
      // Helper total for min booking check (usually checks pre-tax base)
      if (grossAmount < offer.minBookingAmount) return res.status(400).json({ message: `Minimum booking amount should be ₹${offer.minBookingAmount}` });
      if (offer.usageLimit && offer.usageCount >= offer.usageLimit) return res.status(400).json({ message: 'Coupon limit reached' });

      if (offer.discountType === 'percentage') {
        discount = Math.floor((grossAmount * offer.discountValue) / 100);
        if (offer.maxDiscount && discount > offer.maxDiscount) discount = offer.maxDiscount;
      } else {
        discount = Math.floor(offer.discountValue);
      }
      appliedOffer = offer;
    }

    const netAmount = Math.max(0, grossAmount - discount);
    const taxAmount = Math.ceil(netAmount * (taxRate / 100));
    const totalAmount = netAmount + taxAmount;

    // Commission Split (on Net Amount, i.e. excluding tax)
    const adminCommission = Math.ceil(netAmount * (commissionRate / 100));
    const partnerPayout = Math.max(0, netAmount - adminCommission);

    const bookingId = 'BK' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000).toString().padStart(3, '0');

    const booking = await Booking.create({
      userId: req.user._id,
      bookingId,
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
      taxes: taxAmount,
      discount,
      couponCode: appliedOffer ? appliedOffer.code : null,
      adminCommission,
      partnerPayout,
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
      units: 1, // Assuming 1 unit per booking
      createdBy: 'system'
    });
    if (appliedOffer) {
      await Offer.findByIdAndUpdate(appliedOffer._id, { $inc: { usageCount: 1 } });
    }

    const populatedBooking = await Booking.findById(booking._id)
      .populate('propertyId', 'name address images coverImage type checkInTime checkOutTime')
      .populate('roomTypeId', 'name type inventoryType')
      .populate('userId', 'name email phone');

    res.status(201).json({ success: true, booking: populatedBooking });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const getMyBookings = async (req, res) => {
  try {
    const { type } = req.query;
    const query = { userId: req.user._id };

    if (type) {
      switch (type) {
        case 'upcoming':
          query.bookingStatus = { $in: ['confirmed', 'pending', 'paid'] };
          break;
        case 'ongoing':
          query.bookingStatus = { $in: ['checked_in'] };
          break;
        case 'completed':
          query.bookingStatus = { $in: ['completed', 'checked_out'] };
          break;
        case 'cancelled':
          query.bookingStatus = { $in: ['cancelled', 'failed', 'refunded'] };
          break;
        default:
          break;
      }
    }

    const list = await Booking.find(query)
      .populate('propertyId', 'propertyName coverImage images address avgRating type')
      .populate('roomTypeId', 'name type')
      .sort({ createdAt: -1 });
    res.json(list);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const getPartnerBookings = async (req, res) => {
  try {
    const myProps = await Property.find({ partnerId: req.user._id }).select('_id');
    const ids = myProps.map(p => p._id);

    const { status } = req.query; // 'confirmed', 'pending', 'completed', 'cancelled'
    const query = { propertyId: { $in: ids } };

    if (status && status !== 'all') {
      // Map frontend tab names to backend statuses if needed, 
      // but typically tabs match statuses or groups of statuses.
      // Partner tabs: 'confirmed' (Upcoming), 'pending', 'completed', 'cancelled'
      if (status === 'confirmed') {
        // "Upcoming" for partner usually means Confirmed bookings
        query.bookingStatus = 'confirmed';
      } else if (status === 'pending') {
        query.bookingStatus = 'pending';
      } else if (status === 'completed') {
        query.bookingStatus = { $in: ['completed', 'checked_out'] };
      } else if (status === 'cancelled') {
        query.bookingStatus = { $in: ['cancelled', 'failed', 'refunded'] };
      } else {
        query.bookingStatus = status;
      }
    }

    const list = await Booking.find(query)
      .populate('propertyId', 'propertyName address')
      .populate('userId', 'name email phone')
      .populate('roomTypeId', 'name type')
      .sort({ createdAt: -1 });
    res.json(list);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Ownership Check
    if (booking.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    // Status Check
    if (['cancelled', 'completed', 'checked_out'].includes(booking.bookingStatus)) {
      return res.status(400).json({ message: 'Cannot cancel this booking' });
    }

    console.log(`[CancelBooking] ID: ${id}, Status: ${booking.bookingStatus}, Payment: ${booking.paymentStatus}, Amount: ${booking.totalAmount}`);

    // Policy Check: Cancellation allowed only strictly BEFORE Check-in Date
    // If today is 20th and check-in is 20th -> Block
    // If today is 19th and check-in is 20th -> Allow

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkIn = new Date(booking.checkInDate);
    checkIn.setHours(0, 0, 0, 0);

    if (today >= checkIn && req.user.role !== 'admin') { // Admins might override, but users strictly blocked
      return res.status(400).json({
        message: 'Cancellation is only allowed up to 1 day before the Check-in Date.'
      });
    }

    // 1. Update Booking Status
    booking.bookingStatus = 'cancelled';
    booking.cancellationReason = reason || 'User requested cancellation';
    booking.cancelledAt = new Date();

    // If paid, process refund to Wallet
    if (booking.paymentStatus === 'paid') {
      const refundAmount = Number(booking.totalAmount);
      console.log(`[CancelBooking] Processing Refund. Amount: ${refundAmount}`);

      if (isNaN(refundAmount)) {
        console.error("Critical: Booking totalAmount is NaN", booking);
        // throw new Error("Invalid booking amount");
        // Proceed cautiously or fallback?
      }

      // 1. Get or Create User Wallet
      // SELF-HEALING: Wraps creation in try-catch to handle/fix legacy E11000 index error
      let wallet = await Wallet.findOne({ partnerId: booking.userId, role: 'user' });
      if (!wallet) {
        console.log(`[CancelBooking] Wallet not found. Creating new user wallet...`);
        try {
          wallet = await Wallet.create({
            partnerId: booking.userId,
            role: 'user',
            balance: 0
          });
        } catch (err) {
          // If duplicate key error on partnerId, drop the legacy index and retry
          if (err.code === 11000 && (err.keyPattern?.partnerId || err.message.includes('partnerId'))) {
            console.warn("⚠️ Detected legacy 'partnerId_1' index collision. Dropping index and retrying...");
            try {
              await Wallet.collection.dropIndex('partnerId_1');
            } catch (e) { console.log('Index drop ignored:', e.message); }

            // Retry creation
            wallet = await Wallet.create({
              partnerId: booking.userId,
              role: 'user',
              balance: 0
            });
          } else {
            throw err;
          }
        }
      }

      console.log(`[CancelBooking] Wallet ID: ${wallet._id}, Previous Balance: ${wallet.balance}`);

      // 2. Add Refund to Wallet
      wallet.balance += refundAmount;
      await wallet.save();

      console.log(`[CancelBooking] New Balance: ${wallet.balance}`);

      // 3. Create Transaction Record
      await Transaction.create({
        walletId: wallet._id,
        partnerId: booking.userId,
        type: 'credit',
        category: 'refund',
        amount: refundAmount,
        balanceAfter: wallet.balance,
        description: `Refund for Booking #${booking.bookingId}`,
        reference: booking.bookingId,
        status: 'completed',
        metadata: {
          bookingId: booking._id.toString(),
          reason: reason || 'Cancellation Refund'
        }
      });
      console.log(`[CancelBooking] Transaction Created.`);

      // --- PARTNER REVERSAL LOGIC ---
      try {
        // We need partnerId. Usually booking.propertyId is an ID. We need to fetch property or populate.
        // Let's populate quickly.
        const fullB = await Booking.findById(booking._id).populate('propertyId');
        const partnerId = fullB.propertyId?.partnerId;

        if (partnerId) {
          const partnerWallet = await Wallet.findOne({ partnerId: partnerId, role: 'partner' });
          const payout = fullB.partnerPayout || 0;

          if (partnerWallet && payout > 0) {
            // Check if balance enough? If not, negative balance?
            // Usually we allow negative for adjustments or take from pending.
            // We simply reverse what we added.

            partnerWallet.balance -= payout;
            partnerWallet.totalEarnings -= payout; // Decrease earnings as it's cancelled
            await partnerWallet.save();

            await Transaction.create({
              walletId: partnerWallet._id,
              partnerId: partnerId,
              type: 'debit',
              category: 'refund', // or 'adjustment'
              amount: payout,
              balanceAfter: partnerWallet.balance,
              description: `Reversal for Booking #${fullB.bookingId}`,
              reference: fullB.bookingId,
              status: 'completed',
              metadata: {
                bookingId: fullB._id.toString()
              }
            });
            console.log(`[CancelBooking] Reversed ₹${payout} from Partner ${partnerId}`);
          }
        }
      } catch (err) { console.error("Partner Reversal Failed", err); }
      // --- END REVERSAL ---

      booking.paymentStatus = 'refunded';
    } else {
      console.log(`[CancelBooking] Skipped Refund. Payment Status is '${booking.paymentStatus}'`);
    }

    await booking.save();

    // 2. RELEASE INVENTORY
    // We remove ANY ledger entry that refers to this booking ID, regardless of source tag
    await AvailabilityLedger.deleteMany({
      referenceId: booking._id
    });

    res.json({ success: true, message: 'Booking cancelled successfully', booking });

  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Partner Functions


// Get Specific Booking Details for Partner
export const getPartnerBookingDetail = async (req, res) => {
  try {
    const { id } = req.params;

    // Find Booking and Populate
    const booking = await Booking.findById(id)
      .populate('propertyId')
      .populate('userId', 'name email phone')
      .populate('roomTypeId');

    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Verify Ownership (Partner must own the property)
    // Note: propertyId is now an object due to populate
    if (booking.propertyId.partnerId.toString() !== req.user._id.toString()) {
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
    // 1. Update statuses
    booking.paymentStatus = 'paid';
    await booking.save();

    // 3. Financials
    // Partner collected CASH (Total Amount).
    // Platform needs to collect COMMISSION.
    // Debit commission from Partner Wallet to Platform.
    const commission = booking.adminCommission || 0;
    if (commission > 0) {
      const partnerId = req.user._id;
      let partnerWallet = await Wallet.findOne({ partnerId, role: 'partner' });
      if (!partnerWallet) {
        partnerWallet = await Wallet.create({ partnerId, role: 'partner', balance: 0 });
      }

      partnerWallet.balance -= commission;
      partnerWallet.totalEarnings += (booking.totalAmount - commission);

      await partnerWallet.save();

      await Transaction.create({
        walletId: partnerWallet._id,
        partnerId: partnerId,
        type: 'debit',
        category: 'commission_deduction',
        amount: commission,
        balanceAfter: partnerWallet.balance,
        description: `Commission for Cash Booking #${booking.bookingId}`,
        reference: booking.bookingId,
        status: 'completed',
        metadata: { bookingId: booking._id.toString() }
      });
    }

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