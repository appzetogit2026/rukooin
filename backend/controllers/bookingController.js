import Booking from '../models/Booking.js';
import Property from '../models/Property.js';
import Inventory from '../models/Inventory.js';
import VillaDetails from '../models/details/VillaDetails.js';
import Offer from '../models/Offer.js';
import PaymentConfig from '../config/payment.config.js';
import PlatformSettings from '../models/PlatformSettings.js';

// Random Booking ID Generator
const generateBookingId = () => 'BKID' + Math.floor(100000 + Math.random() * 900000);

// Helper function to validate and calculate coupon discount
const calculateCouponDiscount = async (couponCode, baseAmount, userId) => {
  if (!couponCode) return { discount: 0, offer: null };

  const offer = await Offer.findOne({
    code: couponCode.toUpperCase(),
    isActive: true
  });

  if (!offer) {
    throw new Error('Invalid or inactive coupon code');
  }

  // Date validation
  const now = new Date();
  if (offer.startDate > now || (offer.endDate && offer.endDate < now)) {
    throw new Error('Coupon has expired or is not yet active');
  }

  // Min amount check
  if (baseAmount < offer.minBookingAmount) {
    throw new Error(`Minimum booking amount should be ₹${offer.minBookingAmount}`);
  }

  // Usage limit check
  if (offer.usageCount >= offer.usageLimit) {
    throw new Error('Coupon limit reached');
  }

  // Per user limit check
  const userUsage = await Booking.countDocuments({
    userId,
    'couponApplied.code': offer.code,
    status: { $ne: 'cancelled' }
  });

  if (userUsage >= offer.userLimit) {
    throw new Error('You have already used this coupon maximum number of times');
  }

  // Calculate discount
  let discount = 0;
  if (offer.discountType === 'percentage') {
    discount = (baseAmount * offer.discountValue) / 100;
    if (offer.maxDiscount && discount > offer.maxDiscount) {
      discount = offer.maxDiscount;
    }
  } else if (offer.discountType === 'flat') {
    discount = offer.discountValue;
  }

  return { discount, offer };
};

export const createBooking = async (req, res) => {
  try {
    const platformSettings = await PlatformSettings.getSettings();
    if (!platformSettings.platformOpen) {
      return res.status(423).json({
        message: platformSettings.bookingDisabledMessage || 'Bookings are temporarily disabled.',
        code: 'BOOKING_DISABLED'
      });
    }

    const {
      hotelId,
      inventoryId, // Changed from roomId to inventoryId generally, or support both
      roomId, // Legacy support
      checkIn,
      checkOut,
      guests,
      couponCode,
      totalAmount
    } = req.body;

    let targetInventoryId = inventoryId || roomId;

    // Validate Property
    const property = await Property.findById(hotelId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Determine Pricing Logic
    let unitPrice = 0;

    // 1. Inventory Based (Hotel, Hostel, Inventory-based Villa, PG)
    if (targetInventoryId) {
      const inventoryItem = await Inventory.findById(targetInventoryId);
      if (inventoryItem) {
        if (inventoryItem.propertyId.toString() !== hotelId) {
          return res.status(400).json({ message: 'Invalid Room/Unit ID for this property' });
        }

        // Priority: pricing.basePrice > price 
        if (inventoryItem.pricing?.basePrice) {
          unitPrice = inventoryItem.pricing.basePrice;
        } else if (inventoryItem.price) {
          unitPrice = inventoryItem.price;
        } else if (inventoryItem.monthlyPrice) {
          // If only monthly price is available, and user requested 'per night' booking model,
          // we might want to convert or just use it as base. 
          // Assuming user input implies 'monthlyPrice' field IS the rate they want to charge PER UNIT.
          // Or we can just use it as is.
          unitPrice = inventoryItem.monthlyPrice;
        }
      }
    }

    // 2. Entire Villa / Unit Based (If no inventory selected)
    else if (property.propertyType === 'Villa') {
      // Fetch VillaDetails directly to get pricing
      const details = await VillaDetails.findOne({ propertyId: hotelId });
      // Check root pricing object from details
      if (details?.pricing?.basePrice) {
        unitPrice = details.pricing.basePrice;
      }
    }
    // 3. Homestay/Apartment Fallback (If Whole Unit but price in Inventory)
    else if (['Homestay', 'Apartment'].includes(property.propertyType)) {
      // If no inventoryId passed, but it's a whole unit, maybe there's a single inventory item?
      const inventories = await Inventory.find({ propertyId: hotelId });
      if (inventories.length === 1) {
        const item = inventories[0];
        targetInventoryId = item._id; // Auto-assign the inventory ID
        
        // Use this item's price
         if (item.pricing?.basePrice) {
          unitPrice = item.pricing.basePrice;
        } else if (item.price) {
          unitPrice = item.price;
        } else if (item.monthlyPrice) {
          unitPrice = item.monthlyPrice;
        }
      }
    }

    // 4. Fallback (e.g. from Frontend passed total - insecure, use as last resort or validation)
    if (!unitPrice && totalAmount) {
      // Optionally log this or reject. For now, we trust frontend if backend lookup fails 
      // BUT in production, this should ideally be rejected.
      // unitPrice = totalAmount; 
    }

    if (!unitPrice || unitPrice <= 0) {
      return res.status(400).json({ message: 'Unable to determine price for this selection.' });
    }

    // Calculate Duration
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    // Days Diff
    const timeDiff = Math.abs(checkOutDate - checkInDate);
    const dayCount = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    const duration = Math.max(1, dayCount);

    // Calculate Units (Rooms/Beds/Villas)
    const numberOfUnits = guests?.units || guests?.rooms || 1;

    // FINAL BASE AMOUNT CALCULATION
    // Nightly: Price * Units * Nights (For ALL types including PG)
    const baseAmount = unitPrice * numberOfUnits * duration;

    // Commission & Splits
    const commissionRate = PaymentConfig.adminCommissionRate;
    const finalBaseAmount = Math.round(baseAmount);

    const partnerEarning = Math.round(finalBaseAmount * (100 - commissionRate) / 100);
    const adminCommissionOnBase = Math.round(finalBaseAmount * commissionRate / 100);

    // Coupon
    let discount = 0;
    let offerDetails = null;
    try {
      const result = await calculateCouponDiscount(couponCode, finalBaseAmount, req.user._id);
      discount = result.discount;
      offerDetails = result.offer;
    } catch (e) {
      console.log('Coupon Error (Ignored):', e.message);
    }

    const userPayableAmount = finalBaseAmount - discount;
    const adminNetEarning = adminCommissionOnBase - discount;

    const pricing = {
      baseAmount: finalBaseAmount,
      discountAmount: discount,
      userPayableAmount,
      adminCommissionRate: commissionRate,
      adminCommissionOnBase,
      partnerEarning,
      adminNetEarning,
      unitPrice,
      duration,
      units: numberOfUnits,
      period: 'nightly' // Hardcoded as per requirement
    };

    const booking = new Booking({
      bookingId: generateBookingId(),
      userId: req.user._id,
      hotelId,
      roomId: targetInventoryId, // Save the ID if it exists
      checkIn,
      checkOut,
      guests,
      pricing,
      couponApplied: offerDetails ? {
        code: offerDetails.code,
        discountType: offerDetails.discountType,
        discountValue: offerDetails.discountValue,
        discountAmount: discount
      } : undefined,
      couponCode: couponCode ? couponCode.toUpperCase() : undefined,
      discountAmount: discount,
      totalAmount: userPayableAmount,
      status: 'pending',
      paymentStatus: 'pending'
    });

    const savedBooking = await booking.save();
    if (couponCode && offerDetails) {
      await Offer.findByIdAndUpdate(offerDetails._id, { $inc: { usageCount: 1 } });
    }

    console.log('✅ Booking Created:', savedBooking.bookingId);

    res.status(201).json({
      success: true,
      booking: savedBooking,
      pricingBreakdown: {
        baseAmount: finalBaseAmount,
        discount,
        userPays: userPayableAmount
      }
    });

  } catch (error) {
    console.error('Create Booking Error:', error);
    res.status(500).json({ message: 'Server error creating booking', error: error.message });
  }
};

export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate('hotelId')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    console.error('Get My Bookings Error:', error);
    res.status(500).json({ message: 'Server error fetching bookings' });
  }
};

export const getPartnerBookings = async (req, res) => {
  try {
    const myProperties = await Property.find({ ownerId: req.user._id });
    const propertyIds = myProperties.map(p => p._id);

    const bookings = await Booking.find({ hotelId: { $in: propertyIds } })
      .populate('userId', 'name email phone')
      .populate('hotelId')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    console.error('Get Partner Bookings Error:', error);
    res.status(500).json({ message: 'Server error fetching bookings' });
  }
};
