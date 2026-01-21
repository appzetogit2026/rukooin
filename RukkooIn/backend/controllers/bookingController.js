import Property from '../models/Property.js';
import RoomType from '../models/RoomType.js';
import Booking from '../models/Booking.js';
import Offer from '../models/Offer.js';
import PlatformSettings from '../models/PlatformSettings.js';
import AvailabilityLedger from '../models/AvailabilityLedger.js';

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
    res.status(201).json({ success: true, booking });
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
