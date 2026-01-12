import Booking from '../models/Booking.js';
import Property from '../models/Property.js';
import Inventory from '../models/Inventory.js';
import VillaDetails from '../models/details/VillaDetails.js';
import Offer from '../models/Offer.js';
import PaymentConfig from '../config/payment.config.js';

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

/**
 * @desc    Create a new booking with proper payment calculation
 * @route   POST /api/bookings
 * @access  Private
 */
export const createBooking = async (req, res) => {
  try {
    const {
      hotelId,
      roomId,
      checkIn,
      checkOut,
      guests,
      couponCode,
      totalAmount // For backward compatibility
    } = req.body;

    // Validate Property
    const property = await Property.findById(hotelId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    console.log('📋 Creating booking for property:', property.name);

    // Find Price Logic
    let roomPrice = 0;

    // Case 1: Inventory Based (Hotel, Hostel, PG or Inventory-mapped Villa)
    if (roomId) {
      const inventoryItem = await Inventory.findById(roomId);
      if (inventoryItem) {
        // Check mapping
        if (inventoryItem.propertyId.toString() !== hotelId) {
          return res.status(400).json({ message: 'Invalid Room ID for this property' });
        }
        roomPrice = inventoryItem.price;
        console.log('💰 Using Inventory price:', roomPrice);
      }
    }

    // Case 2: Villa (Entire Place)
    if (!roomPrice && property.propertyType === 'Villa') {
      const details = await VillaDetails.findOne({ propertyId: hotelId });
      if (details && details.pricing?.basePrice) {
        roomPrice = details.pricing.basePrice;
        console.log('💰 Using Villa Base Price:', roomPrice);
      }
    }

    // Fallback
    if (!roomPrice) {
      roomPrice = totalAmount || 0;
      console.log('💰 Using fallback/totalAmount:', roomPrice);
    }

    if (!roomPrice || roomPrice <= 0) {
      return res.status(400).json({
        message: 'Invalid price. Property must have a price or you must provide totalAmount',
      });
    }

    // Calculate nights
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

    if (nights < 1) {
      return res.status(400).json({ message: 'Check-out must be after check-in' });
    }

    // Calculate base amount
    const numberOfRooms = guests?.rooms || 1;
    const baseAmount = roomPrice * nights * numberOfRooms;

    console.log('💵 Calculation:', { roomPrice, nights, numberOfRooms, baseAmount });

    // Calculate pricing
    const commissionRate = PaymentConfig.adminCommissionRate;
    const finalBaseAmount = Math.round(baseAmount);

    // Step 2: Calculate partner earning (90% of base)
    const partnerEarning = Math.round(finalBaseAmount * (100 - commissionRate) / 100);

    // Step 3: Calculate admin commission on base (10% of base)
    const adminCommissionOnBase = Math.round(finalBaseAmount * commissionRate / 100);

    // Step 4: Apply coupon discount
    let discount = 0;
    let offerDetails = null;

    try {
      const result = await calculateCouponDiscount(couponCode, finalBaseAmount, req.user._id);
      discount = result.discount;
      offerDetails = result.offer;
    } catch (couponError) {
      // Coupon error is not critical - continue without discount
      console.log('Coupon error (continuing without discount):', couponError.message);
    }

    // Step 5: User payable amount
    const userPayableAmount = finalBaseAmount - discount;

    // Step 6: Admin net earning (commission - discount)
    const adminNetEarning = adminCommissionOnBase - discount;

    // Create pricing object
    const pricing = {
      baseAmount: finalBaseAmount,
      discountAmount: discount,
      userPayableAmount,
      adminCommissionRate: commissionRate,
      adminCommissionOnBase,
      partnerEarning,
      adminNetEarning
    };

    // Create booking
    const booking = new Booking({
      bookingId: generateBookingId(),
      userId: req.user._id,
      hotelId,
      roomId,
      checkIn,
      checkOut,
      guests,

      // New pricing structure
      pricing,

      // Coupon details
      couponApplied: offerDetails ? {
        code: offerDetails.code,
        discountType: offerDetails.discountType,
        discountValue: offerDetails.discountValue,
        discountAmount: discount
      } : undefined,

      // Legacy fields for backward compatibility
      couponCode: couponCode ? couponCode.toUpperCase() : undefined,
      discountAmount: discount,
      totalAmount: userPayableAmount,

      status: 'pending', // Pending until payment
      paymentStatus: 'pending'
    });

    const savedBooking = await booking.save();

    // Increment Coupon usage if applied
    if (couponCode && offerDetails) {
      await Offer.findByIdAndUpdate(
        offerDetails._id,
        { $inc: { usageCount: 1 } }
      );
    }

    console.log('✅ Booking created:', savedBooking.bookingId);

    res.status(201).json({
      success: true,
      booking: savedBooking,
      pricingBreakdown: {
        baseAmount: finalBaseAmount,
        discount: discount,
        userPays: userPayableAmount,
        partnerGets: partnerEarning,
        adminCommission: adminCommissionOnBase,
        adminNet: adminNetEarning
      }
    });

  } catch (error) {
    console.error('Create Booking Error:', error);
    res.status(500).json({ message: 'Server error creating booking', error: error.message });
  }
};

/**
 * @desc    Get my bookings
 * @route   GET /api/bookings/my-bookings
 * @access  Private
 */
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

/**
 * @desc    Get partner bookings
 * @route   GET /api/bookings/partner/all
 * @access  Private (Partner)
 */
export const getPartnerBookings = async (req, res) => {
  try {
    // Get properties owned by this partner (Updated to Property model)
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
