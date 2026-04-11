import mongoose from 'mongoose';
import Partner from '../models/Partner.js';
import Property from '../models/Property.js';
import RoomType from '../models/RoomType.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

/**
 * @desc    Fast Onboard Partner and Property (Admin Super Power)
 * @route   POST /api/admin/fast-onboard
 * @access  Private (Admin)
 */
export const fastOnboard = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { ownerDetails, propertyDetails, roomTypes } = req.body;

    // 1. Handle Partner
    let partner = await Partner.findOne({ phone: ownerDetails.phone }).session(session);
    let isNewPartner = false;

    if (!partner) {
      isNewPartner = true;
      const tempPassword = Math.random().toString(36).slice(-10);
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      partner = new Partner({
        name: ownerDetails.name,
        email: ownerDetails.email || `${ownerDetails.phone}@rukooin.com`,
        phone: ownerDetails.phone,
        password: hashedPassword,
        ownerName: ownerDetails.name,
        whatsappNumber: ownerDetails.whatsappNumber || ownerDetails.phone,
        isFastOnboarded: true,
        partnerApprovalStatus: 'approved', // Admin registered partners are pre-approved
        isVerified: true
      });
      await partner.save({ session });
    }

    // 2. Create Property
    const property = new Property({
      propertyName: propertyDetails.propertyName,
      contactNumber: propertyDetails.contactNumber || ownerDetails.phone,
      propertyType: propertyDetails.propertyType || 'hotel',
      hotelCategory: propertyDetails.hotelCategory || 'Budget',
      starRating: propertyDetails.starRating || 3,
      shortDescription: propertyDetails.description,
      partnerId: partner._id,
      address: propertyDetails.address,
      location: propertyDetails.location,
      nearbyPlaces: propertyDetails.nearbyPlaces || [],
      suitability: propertyDetails.suitability || 'Both',
      coverImage: propertyDetails.coverImage,
      propertyImages: propertyDetails.images || [],
      amenities: propertyDetails.amenities || [],
      checkInTime: propertyDetails.checkInTime || '12:00 PM',
      checkOutTime: propertyDetails.checkOutTime || '11:00 AM',
      status: 'approved',
      isLive: true,
      fastTracked: true,
      kycStatus: 'pending',
      kycDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days grace period
    });

    await property.save({ session });

    // 3. Create Room Types
    if (roomTypes && roomTypes.length > 0) {
      const roomTypeDocs = roomTypes.map(rt => ({
        propertyId: property._id,
        name: rt.name,
        inventoryType: rt.inventoryType || 'room',
        totalInventory: rt.totalInventory || 1,
        pricePerNight: rt.pricePerNight,
        maxAdults: rt.maxAdults || 2,
        maxChildren: rt.maxChildren || 0,
        extraAdultPrice: rt.extraAdultPrice || 0,
        extraChildPrice: rt.extraChildPrice || 0,
        amenities: rt.amenities || [],
        images: (rt.images && rt.images.length >= 3) 
          ? rt.images 
          : [propertyDetails.coverImage, propertyDetails.coverImage, propertyDetails.coverImage]
      }));
      await RoomType.insertMany(roomTypeDocs, { session });
    }

    // 4. Generate Magic Link (One-time)
    const jti = uuidv4();
    partner.magicTokenJti = jti;
    await partner.save({ session });

    const magicToken = jwt.sign(
      { id: partner._id, role: 'partner', jti },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    const magicLink = `${process.env.FRONTEND_URL || 'https://rukooin.com'}/hotel/magic-login?token=${magicToken}`;

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: 'Property and Partner onboarded successfully!',
      propertyId: property._id,
      partnerId: partner._id,
      isNewPartner,
      magicLink // Admin will copy this manually as per user request
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Fast Onboard Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error during onboarding' });
  }
};
