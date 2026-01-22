import User from '../models/User.js';
import Partner from '../models/Partner.js';
import InfoPage from '../models/InfoPage.js';
import ContactMessage from '../models/ContactMessage.js';
import PlatformSettings from '../models/PlatformSettings.js';
import Property from '../models/Property.js';
import RoomType from '../models/RoomType.js';
import Booking from '../models/Booking.js';
import PropertyDocument from '../models/PropertyDocument.js';
import Review from '../models/Review.js';
import AvailabilityLedger from '../models/AvailabilityLedger.js';
import Wallet from '../models/Wallet.js';
import Transaction from '../models/Transaction.js';
import Withdrawal from '../models/Withdrawal.js';
import Banner from '../models/Banner.js';
import Faq from '../models/Faq.js';
import Notification from '../models/Notification.js';
import notificationService from '../services/notificationService.js';
import Admin from '../models/Admin.js';
import AuditLog from '../models/AuditLog.js';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { logAuditAction } from '../utils/auditLogger.js';

export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalPartners = await Partner.countDocuments();
    const totalHotels = await Property.countDocuments();
    const pendingHotels = await Property.countDocuments({ status: 'pending' });
    const totalBookings = await Booking.countDocuments();
    const confirmedBookings = await Booking.countDocuments({ bookingStatus: 'confirmed' });

    // Revenue Aggregation
    const revenueData = await Booking.aggregate([
      { $match: { bookingStatus: { $in: ['confirmed', 'checked_out'] }, paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueData.length ? revenueData[0].total : 0;

    // Daily Revenue & Bookings (Last 30 Days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyTrends = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
          bookingStatus: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: { $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$totalAmount", 0] } },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // Property Type Distribution
    const propertyDistribution = await Property.aggregate([
      { $group: { _id: "$propertyType", count: { $sum: 1 } } }
    ]);

    // KYC Stats
    const pendingUserKYC = await User.countDocuments({
      role: 'user',
      isVerified: false,
      aadhaarNumber: { $exists: true, $ne: "" }
    });
    const pendingPartnerKYC = await Partner.countDocuments({
      partnerApprovalStatus: 'pending'
    });

    const recentBookings = await Booking.find()
      .populate('userId', 'name')
      .populate('propertyId', 'propertyName')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentPropertyRequests = await Property.find({ status: 'pending' })
      .populate('partnerId', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalPartners,
        totalHotels,
        pendingHotels,
        totalBookings,
        confirmedBookings,
        totalRevenue,
        pendingUserKYC,
        pendingPartnerKYC
      },
      dailyTrends,
      propertyDistribution,
      recentBookings,
      recentPropertyRequests
    });
  } catch (error) {
    console.error('Get Admin Dashboard Stats Error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching dashboard stats' });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { search, role, status } = req.query;

    let Model = User;
    let query = {};

    if (role === 'partner') {
      Model = Partner;
      if (req.query.approvalStatus) {
        query.partnerApprovalStatus = req.query.approvalStatus;
      }
    } else {
      query.role = 'user';
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      query.isBlocked = status === 'blocked';
    }

    // Default User query needs role='user' if we are querying User model
    // But my previous code sets query.role='user' explicitly in else block
    // So this is fine.

    const total = await Model.countDocuments(query);
    const users = await Model.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({ success: true, users, total, page, limit });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching users' });
  }
};

export const getPendingVerifications = async (req, res) => {
  try {
    const pendingPartners = await Partner.find({
      partnerApprovalStatus: 'pending',
      $or: [
        { aadhaarNumber: { $exists: true, $ne: "" } },
        { panNumber: { $exists: true, $ne: "" } }
      ]
    }).select('name email phone partnerApprovalStatus aadhaarNumber panNumber');

    const pendingProperties = await Property.find({
      status: 'pending'
    }).populate('partnerId', 'name email').select('propertyName propertyType address status');

    const pendingPropertyDocs = await PropertyDocument.find({
      verificationStatus: 'pending'
    }).populate({
      path: 'propertyId',
      select: 'propertyName propertyType status',
      populate: { path: 'partnerId', select: 'name' }
    });

    res.status(200).json({
      success: true,
      partners: pendingPartners,
      properties: pendingProperties,
      documents: pendingPropertyDocs
    });
  } catch (error) {
    console.error('Pending Verifications Error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching pending verifications' });
  }
};


export const getAllHotels = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { search, status, type } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { propertyName: { $regex: search, $options: 'i' } },
        { 'address.city': { $regex: search, $options: 'i' } },
        { 'address.state': { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      query.status = status;
    }

    if (type) {
      query.propertyType = String(type).toLowerCase();
    }

    const total = await Property.countDocuments(query);

    const hotels = await Property.find(query)
      .populate('partnerId', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({ success: true, hotels, total, page, limit });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error fetching hotels' });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { status, search } = req.query;

    let query = {};
    if (status) query.bookingStatus = status;

    if (search) {
      // Find users or properties matching search to get IDs
      const users = await User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      const userIds = users.map(u => u._id);

      const properties = await Property.find({
        propertyName: { $regex: search, $options: 'i' }
      }).select('_id');
      const propertyIds = properties.map(p => p._id);

      query.$or = [
        { userId: { $in: userIds } },
        { propertyId: { $in: propertyIds } }
      ];

      // Also search by booking ID if it matches search (regex for partial match if it looks like an ID)
      if (mongoose.Types.ObjectId.isValid(search)) {
        query.$or.push({ _id: search });
      }
    }

    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate('userId', 'name email phone')
      .populate('propertyId', 'propertyName coverImage address')
      .populate('roomTypeId', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({ success: true, bookings, total, page, limit });
  } catch (error) {
    console.error('GetAllBookings Error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching bookings' });
  }
};

export const getPropertyRequests = async (req, res) => {
  try {
    const hotels = await Property.find({ status: 'pending' })
      .populate('partnerId', 'name email phone')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, hotels });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error fetching property requests' });
  }
};

export const updateHotelStatus = async (req, res) => {
  try {
    const { propertyId, hotelId, status, isLive, isFeatured } = req.body;

    const id = propertyId || hotelId;
    if (!id) {
      return res.status(400).json({ success: false, message: 'Property id is required' });
    }

    const update = {};
    if (status) {
      update.status = status;
      if (status === 'approved') {
        update.isLive = true;
      }
      if (status === 'rejected' || status === 'suspended' || status === 'draft') {
        update.isLive = false;
      }
    }

    if (typeof isLive === 'boolean') {
      update.isLive = isLive;
    }

    if (typeof isFeatured === 'boolean') {
      update.isFeatured = isFeatured;
    }

    const hotel = await Property.findByIdAndUpdate(id, update, { new: true });
    if (!hotel) return res.status(404).json({ success: false, message: 'Property not found' });

    // Log property status change
    if (status) {
      const actionMap = {
        'approved': 'PROPERTY_APPROVED',
        'rejected': 'PROPERTY_REJECTED',
        'suspended': 'PROPERTY_REJECTED'
      };

      if (actionMap[status]) {
        await logAuditAction({
          adminId: req.user.id,
          action: actionMap[status],
          description: `Property "${hotel.name}" ${status} by admin`,
          targetType: 'Property',
          targetId: hotel._id,
          req,
          metadata: { previousStatus: hotel.status, newStatus: status }
        });
      }
    }

    res.status(200).json({ success: true, hotel });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error updating hotel status' });
  }
};

export const updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const property = await Property.findByIdAndUpdate(id, updateData, { new: true });
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });

    res.status(200).json({
      success: true,
      message: 'Property updated successfully',
      property
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating property details' });
  }
};

export const verifyPropertyDocuments = async (req, res) => {
  try {
    const { propertyId, action, adminRemark } = req.body;
    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });
    const docs = await PropertyDocument.findOne({ propertyId });
    if (!docs) return res.status(404).json({ success: false, message: 'Documents not found' });
    if (action === 'approve') {
      docs.verificationStatus = 'verified';
      docs.adminRemark = undefined;
      docs.verifiedAt = new Date();
      property.status = 'approved';
      property.isLive = true;
    } else if (action === 'reject') {
      docs.verificationStatus = 'rejected';
      docs.adminRemark = adminRemark;
      docs.verifiedAt = new Date();
      property.status = 'rejected';
      property.isLive = false;
    } else {
      return res.status(400).json({ success: false, message: 'Invalid action' });
    }
    await docs.save();
    await property.save();

    // --- NOTIFICATION HOOK: PROPERTY VERIFIED ---
    try {
      if (action === 'approve') {
        const liveMsg = `Your property ${property.propertyName} is LIVE now! 🏨`;
        // Push + Email
        await notificationService.sendToUser(property.partnerId, {
          title: 'Property Live! 🟢',
          body: liveMsg
        }, {
          sendEmail: true,
          emailHtml: `
            <h3>Property Approved</h3>
            <p>Great news! Your property <strong>${property.propertyName}</strong> has been verified and is now <strong>LIVE</strong> on Rukkoo.</p>
            <p>Users can now start booking stays at your property.</p>
          `,
          type: 'property_live',
          data: { propertyId: property._id }
        }, 'partner');
      }
    } catch (notifErr) {
      console.error('Property Verify Notif Error:', notifErr.message);
    }
    // ------------------------------------------

    res.status(200).json({ success: true, property, documents: docs });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error verifying documents' });
  }
};

export const getReviewModeration = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { status, search } = req.query;

    let query = {};
    if (status && status !== 'All') query.status = status.toLowerCase();

    if (search) {
      // Find properties by name to filter reviews
      const properties = await Property.find({ propertyName: { $regex: search, $options: 'i' } }).select('_id');
      const users = await User.find({ name: { $regex: search, $options: 'i' } }).select('_id');

      query.$or = [
        { propertyId: { $in: properties.map(p => p._id) } },
        { userId: { $in: users.map(u => u._id) } },
        { comment: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Review.countDocuments(query);
    const reviews = await Review.find(query)
      .populate('userId', 'name email phone')
      .populate('propertyId', 'propertyName address')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({ success: true, reviews, total, page, limit });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching reviews' });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.body;
    const review = await Review.findByIdAndDelete(reviewId);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    const agg = await Review.aggregate([
      { $match: { propertyId: review.propertyId, status: 'approved' } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    const stats = agg[0];
    if (stats) {
      await Property.findByIdAndUpdate(review.propertyId, { avgRating: stats.avg, totalReviews: stats.count });
    } else {
      await Property.findByIdAndUpdate(review.propertyId, { avgRating: 0, totalReviews: 0 });
    }
    res.status(200).json({ success: true, message: 'Review deleted successfully' });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error deleting review' });
  }
};

export const updateReviewStatus = async (req, res) => {
  try {
    const { reviewId, status } = req.body;
    const review = await Review.findByIdAndUpdate(reviewId, { status }, { new: true });
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    const agg = await Review.aggregate([
      { $match: { propertyId: review.propertyId, status: 'approved' } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    const stats = agg[0];
    if (stats) {
      await Property.findByIdAndUpdate(review.propertyId, { avgRating: stats.avg, totalReviews: stats.count });
    } else {
      await Property.findByIdAndUpdate(review.propertyId, { avgRating: 0, totalReviews: 0 });
    }
    res.status(200).json({ success: true, message: `Review status updated to ${status}`, review });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error updating review status' });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { userId, isBlocked, isSuspicious } = req.body;
    const update = {};
    if (typeof isBlocked === 'boolean') update.isBlocked = isBlocked;
    if (typeof isSuspicious === 'boolean') update.isSuspicious = isSuspicious;

    const user = await User.findByIdAndUpdate(userId, update, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.status(200).json({
      success: true,
      message: 'User status updated successfully',
      user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating user status' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { userId, role } = req.body;
    let deleted;
    if (role === 'partner') {
      deleted = await Partner.findByIdAndDelete(userId);
    } else {
      deleted = await User.findByIdAndDelete(userId);
    }

    if (!deleted) return res.status(404).json({ success: false, message: 'User/Partner not found' });
    res.status(200).json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error deleting user' });
  }
};

export const deleteHotel = async (req, res) => {
  try {
    const { propertyId, hotelId } = req.body;
    const id = propertyId || hotelId;

    if (!id) {
      return res.status(400).json({ success: false, message: 'Property id is required' });
    }

    const del = await Property.findByIdAndDelete(id);
    if (!del) return res.status(404).json({ success: false, message: 'Property not found' });

    await PropertyDocument.deleteMany({ propertyId: id });
    await RoomType.deleteMany({ propertyId: id });

    res.status(200).json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error deleting property' });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId, status } = req.body;
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    booking.bookingStatus = status;
    await booking.save();

    if (status === 'cancelled') {
      await AvailabilityLedger.deleteMany({
        source: 'platform',
        referenceId: booking._id
      });
    }

    res.status(200).json({ success: true, booking });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error updating booking status' });
  }
};

export const getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const bookings = await Booking.find({ userId: id })
      .populate('propertyId', 'propertyName address coverImage')
      .sort({ createdAt: -1 });

    // Fetch Wallet (Partners definitely have them, Users might if they have refunds/topups)
    const wallet = await Wallet.findOne({ partnerId: id });

    // Fetch Transactions
    const transactions = await Transaction.find({
      $or: [
        { partnerId: id },
        { walletId: wallet?._id }
      ].filter(q => q.partnerId || q.walletId)
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      user,
      bookings,
      wallet: wallet || { balance: 0, totalEarnings: 0, totalWithdrawals: 0 },
      transactions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching user details' });
  }
};

export const getPartnerDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await Partner.findById(id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'Partner not found' });

    // Fetch Properties owned by this partner
    const properties = await Property.find({ partnerId: id });

    // Fetch Wallet & Transactions (Partners always have/need them)
    let wallet = await Wallet.findOne({ partnerId: id });
    if (!wallet) {
      // Create wallet if missing for partner (safety catch)
      wallet = await Wallet.create({ partnerId: id });
    }

    const transactions = await Transaction.find({ partnerId: id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      partner: user,
      properties: properties || [],
      wallet: wallet || { balance: 0, totalEarnings: 0, totalWithdrawals: 0 },
      transactions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching partner details' });
  }
};


export const updatePartnerSettings = async (req, res) => {
  try {
    const { userId, commissionPercentage, payoutOnHold } = req.body;
    const update = {};
    if (typeof commissionPercentage === 'number') update.commissionPercentage = commissionPercentage;
    if (typeof payoutOnHold === 'boolean') update.payoutOnHold = payoutOnHold;

    const user = await Partner.findByIdAndUpdate(userId, update, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'Partner not found' });

    res.status(200).json({
      success: true,
      message: 'Partner settings updated successfully',
      user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating partner settings' });
  }
};

export const getHotelDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const property = await Property.findById(id).populate('partnerId', 'name email phone');
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });

    const roomTypes = await RoomType.find({ propertyId: id, isActive: true });
    const documents = await PropertyDocument.findOne({ propertyId: id });

    res.status(200).json({
      success: true,
      hotel: {
        ...property.toObject(),
        rooms: roomTypes
      },
      bookings: [],
      documents
    });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error fetching hotel details' });
  }
};

export const getBookingDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id)
      .populate('userId', 'name email phone aadhaarNumber panNumber')
      .populate({
        path: 'propertyId',
        select: 'propertyName coverImage address partnerId',
        populate: { path: 'partnerId', select: 'name email phone' }
      })
      .populate('roomTypeId', 'title basePrice');

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.status(200).json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching booking details' });
  }
};

export const updatePartnerApprovalStatus = async (req, res) => {
  try {
    const { userId, status } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid partner approval status' });
    }
    const user = await Partner.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Partner not found' });
    }
    user.partnerApprovalStatus = status;
    if (status === 'approved') {
      if (!user.partnerSince) {
        user.partnerSince = new Date();
      }
    }
    await user.save();

    // --- NOTIFICATION HOOK: PARTNER APPROVAL UPDATE ---
    try {
      if (status === 'approved') {
        const approvedMsg = 'Congrats! Your Partner Account is Approved. Login now to list properties.';
        // Email + Push
        await notificationService.sendToUser(user._id, {
          title: 'Partner Account Approved ✅',
          body: approvedMsg
        }, {
          sendEmail: true,
          emailHtml: `
            <h3>Application Approved! 🎉</h3>
            <p>Hi ${user.name},</p>
            <p>Your application to become a Rukkoo Partner has been <strong>APPROVED</strong>!</p>
            <p>You can now login to your partner dashboard and start listing your properties.</p>
            <p><a href="${process.env.FRONTEND_URL}/partner/login">Login to Partner Dashboard</a></p>
          `,
          type: 'partner_approved'
        });
      }

      if (status === 'rejected') {
        const rejectedMsg = 'Your Partner Application has been updated. Please check your email for details.';
        // Email only (Push optional if they can't login, but usually email is better for rejection)
        await notificationService.sendToUser(user._id, {
          title: 'Partner Account Update',
          body: rejectedMsg
        }, {
          sendEmail: true,
          emailHtml: `
            <h3>Application Status Update</h3>
            <p>Hi ${user.name},</p>
            <p>We have reviewed your partner application.</p>
            <p><strong>Status:</strong> Rejected/Changes Requested</p>
            <p>Please contact support for more details.</p>
          `,
          type: 'partner_rejected'
        });
      }
    } catch (notifErr) {
      console.error('Partner Approval Notif Error:', notifErr.message);
    }
    // --------------------------------------------------

    res.status(200).json({ success: true, message: `Partner status updated to ${status}`, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating partner approval status' });
  }
};

export const getLegalPages = async (req, res) => {
  try {
    const { audience } = req.query;
    const query = {};

    if (audience) {
      query.audience = audience;
    }

    const pages = await InfoPage.find(query).sort({ audience: 1, slug: 1 });

    res.status(200).json({ success: true, pages });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching legal pages' });
  }
};

export const upsertLegalPage = async (req, res) => {
  try {
    const { audience, slug, title, content, isActive } = req.body;

    if (!['user', 'partner'].includes(audience)) {
      return res.status(400).json({ success: false, message: 'Invalid audience' });
    }

    if (!['terms', 'privacy', 'about', 'contact'].includes(slug)) {
      return res.status(400).json({ success: false, message: 'Invalid page type' });
    }

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required' });
    }

    const update = {
      audience,
      slug,
      title,
      content
    };

    if (typeof isActive === 'boolean') {
      update.isActive = isActive;
    }

    const page = await InfoPage.findOneAndUpdate(
      { audience, slug },
      update,
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, page });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error saving legal page' });
  }
};

export const getContactMessages = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { audience, status, search } = req.query;

    const query = {};
    if (audience) query.audience = audience;
    if (status && status !== 'all') query.status = status;

    if (search) {
      query.$or = [
        { ticketId: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await ContactMessage.countDocuments(query);
    const messages = await ContactMessage.find(query)
      .populate('internalNotes.adminId', 'name')
      .populate('replies.adminId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({ success: true, messages, total, page, limit });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching contact messages' });
  }
};

export const updateContactStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['new', 'in_progress', 'resolved', 'closed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const message = await ContactMessage.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    res.status(200).json({ success: true, message: 'Status updated successfully', contact: message });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating contact status' });
  }
};

export const addInternalNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;
    const adminId = req.user._id;

    const ticket = await ContactMessage.findByIdAndUpdate(
      id,
      { $push: { internalNotes: { note, adminId } } },
      { new: true }
    ).populate('internalNotes.adminId', 'name');

    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
    res.status(200).json({ success: true, ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error adding note' });
  }
};

export const replyToTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const adminId = req.user._id;

    // In a real app, send email here
    const ticket = await ContactMessage.findByIdAndUpdate(
      id,
      {
        $push: { replies: { message, adminId } },
        status: 'in_progress'
      },
      { new: true }
    ).populate('replies.adminId', 'name');

    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
    res.status(200).json({ success: true, ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error replying to ticket' });
  }
};

export const getPlatformSettings = async (req, res) => {
  try {
    const settings = await PlatformSettings.getSettings();
    res.status(200).json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching platform settings' });
  }
};

export const updatePlatformSettings = async (req, res) => {
  try {
    const {
      platformOpen, maintenanceMode, bookingDisabledMessage,
      maintenanceTitle, maintenanceMessage, defaultCommission,
      taxRate, autoPayoutEnabled, defaultCheckInTime,
      defaultCheckOutTime, pgMinStay, supportEmail, supportPhone
    } = req.body;
    const settings = await PlatformSettings.getSettings();

    if (typeof platformOpen === 'boolean') settings.platformOpen = platformOpen;
    if (typeof maintenanceMode === 'boolean') settings.maintenanceMode = maintenanceMode;
    if (typeof bookingDisabledMessage === 'string') settings.bookingDisabledMessage = bookingDisabledMessage;
    if (typeof maintenanceTitle === 'string') settings.maintenanceTitle = maintenanceTitle;
    if (typeof maintenanceMessage === 'string') settings.maintenanceMessage = maintenanceMessage;

    if (typeof defaultCommission === 'number') settings.defaultCommission = defaultCommission;
    if (typeof taxRate === 'number') settings.taxRate = taxRate;
    if (typeof autoPayoutEnabled === 'boolean') settings.autoPayoutEnabled = autoPayoutEnabled;

    if (typeof defaultCheckInTime === 'string') settings.defaultCheckInTime = defaultCheckInTime;
    if (typeof defaultCheckOutTime === 'string') settings.defaultCheckOutTime = defaultCheckOutTime;
    if (typeof pgMinStay === 'number') settings.pgMinStay = pgMinStay;
    if (typeof supportEmail === 'string') settings.supportEmail = supportEmail;
    if (typeof supportPhone === 'string') settings.supportPhone = supportPhone;

    await settings.save();

    // Log settings update
    await logAuditAction({
      adminId: req.user.id,
      action: 'SETTINGS_UPDATED',
      description: 'Platform settings updated',
      targetType: 'Settings',
      targetId: settings._id,
      req,
      metadata: {
        platformOpen,
        maintenanceMode,
        defaultCommission,
        taxRate,
        autoPayoutEnabled
      }
    });

    res.status(200).json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating platform settings' });
  }
};

export const getFinanceData = async (req, res) => {
  try {
    const totalTransactions = await Transaction.countDocuments();
    const recentTransactions = await Transaction.find()
      .populate('partnerId', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    const pendingWithdrawals = await Withdrawal.find({ status: 'pending' })
      .populate('partnerId', 'name email phone')
      .sort({ createdAt: -1 });

    const processedWithdrawals = await Withdrawal.find({ status: 'completed' })
      .populate('partnerId', 'name email')
      .limit(10)
      .sort({ updatedAt: -1 });

    // Aggregations
    const stats = await Transaction.aggregate([
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" }
        }
      }
    ]);

    const revenueStats = {
      totalRevenue: stats.find(s => s._id === 'booking_payment')?.total || 0,
      totalCommissions: stats.find(s => s._id === 'commission_deduction')?.total || 0,
      totalPayouts: stats.find(s => s._id === 'withdrawal')?.total || 0,
      pendingPayouts: pendingWithdrawals.reduce((acc, w) => acc + w.amount, 0)
    };

    res.status(200).json({
      success: true,
      stats: revenueStats,
      recentTransactions,
      pendingWithdrawals,
      processedWithdrawals
    });
  } catch (error) {
    console.error('Finance Data Error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching finance data' });
  }
};

export const getTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { type, category, status, search } = req.query;

    const query = {};
    if (type) query.type = type;
    if (category) query.category = category;
    if (status) query.status = status;

    if (search) {
      const users = await User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      query.partnerId = { $in: users.map(u => u._id) };
    }

    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .populate('partnerId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({ success: true, transactions, total, page, limit });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching transactions' });
  }
};

export const processWithdrawal = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { withdrawalId, action, remarks, utrNumber } = req.body;
    const withdrawal = await Withdrawal.findById(withdrawalId);

    if (!withdrawal) {
      return res.status(404).json({ success: false, message: 'Withdrawal request not found' });
    }

    if (withdrawal.status !== 'pending' && withdrawal.status !== 'processing') {
      return res.status(400).json({ success: false, message: 'Withdrawal already processed' });
    }

    if (action === 'approve') {
      withdrawal.status = 'completed';
      withdrawal.processingDetails = {
        ...withdrawal.processingDetails,
        processedAt: new Date(),
        completedAt: new Date(),
        utrNumber,
        remarks
      };

      // Update transaction status linked to this withdrawal
      if (withdrawal.transactionId) {
        await Transaction.findByIdAndUpdate(withdrawal.transactionId, { status: 'completed' }, { session });
      }
    } else if (action === 'reject') {
      withdrawal.status = 'cancelled';
      withdrawal.processingDetails = {
        ...withdrawal.processingDetails,
        processedAt: new Date(),
        remarks
      };

      // Refund the wallet
      const wallet = await Wallet.findById(withdrawal.walletId);
      wallet.balance += withdrawal.amount;
      wallet.totalWithdrawals -= withdrawal.amount;
      await wallet.save({ session });

      // Link transaction should be cancelled
      if (withdrawal.transactionId) {
        await Transaction.findByIdAndUpdate(withdrawal.transactionId, { status: 'cancelled' }, { session });
      }
    }

    await withdrawal.save({ session });
    await session.commitTransaction();
    session.endSession();

    // Log payout action
    await logAuditAction({
      adminId: req.user.id,
      action: 'PAYOUT_RELEASED',
      description: `Withdrawal ${action === 'approve' ? 'approved' : 'rejected'} for ₹${withdrawal.amount} (${withdrawal.partnerId})`,
      targetType: 'Transaction',
      targetId: withdrawal._id,
      req,
      metadata: {
        action,
        amount: withdrawal.amount,
        partnerId: withdrawal.partnerId,
        utrNumber,
        remarks
      }
    });

    res.status(200).json({ success: true, message: `Withdrawal ${action} successfully` });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Process Withdrawal Error:', error);
    res.status(500).json({ success: false, message: 'Server error processing withdrawal' });
  }
};

// --- Banner Management ---
export const getBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ order: 1 });
    res.status(200).json({ success: true, banners });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching banners' });
  }
};

export const createBanner = async (req, res) => {
  try {
    const banner = await Banner.create(req.body);
    res.status(201).json({ success: true, banner });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error creating banner' });
  }
};

export const updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await Banner.findByIdAndUpdate(id, req.body, { new: true });
    if (!banner) return res.status(404).json({ success: false, message: 'Banner not found' });
    res.status(200).json({ success: true, banner });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating banner' });
  }
};

export const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    await Banner.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: 'Banner deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error deleting banner' });
  }
};

// --- FAQ Management ---
export const getFaqs = async (req, res) => {
  try {
    const { audience } = req.query;
    const query = audience ? { audience } : {};
    const faqs = await Faq.find(query).sort({ category: 1, order: 1 });
    res.status(200).json({ success: true, faqs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching FAQs' });
  }
};

export const createFaq = async (req, res) => {
  try {
    const faq = await Faq.create(req.body);
    res.status(201).json({ success: true, faq });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error creating FAQ' });
  }
};

export const updateFaq = async (req, res) => {
  try {
    const { id } = req.params;
    const faq = await Faq.findByIdAndUpdate(id, req.body, { new: true });
    if (!faq) return res.status(404).json({ success: false, message: 'FAQ not found' });
    res.status(200).json({ success: true, faq });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating FAQ' });
  }
};

export const deleteFaq = async (req, res) => {
  try {
    const { id } = req.params;
    await Faq.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: 'FAQ deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error deleting FAQ' });
  }
};

// --- Notification Management ---
export const getNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find()
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Notification.countDocuments();

    res.status(200).json({
      success: true,
      notifications,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching notifications' });
  }
};

export const sendBroadcastNotification = async (req, res) => {
  try {
    const { title, body, audience, type, actionUrl, image } = req.body;
    const adminId = req.user._id;

    // Create record in DB
    const notification = await Notification.create({
      title,
      body,
      recipientRole: audience,
      type,
      actionUrl,
      image,
      createdBy: adminId,
      status: 'sent'
    });

    // In a real app, integrate with Firebase Admin SDK here:
    // const fcmTokens = await User.find({ role: audience === 'all' ? { $exists: true } : audience, fcmToken: { $ne: null } }).distinct('fcmToken');
    // if (fcmTokens.length > 0) { await admin.messaging().sendToDevice(fcmTokens, { notification: { title, body } }); }

    // Log broadcast notification
    await logAuditAction({
      adminId: req.user.id,
      action: 'NOTIFICATION_SENT',
      description: `Broadcast notification sent to ${audience}: "${title}"`,
      targetType: 'Notification',
      targetId: notification._id,
      req,
      metadata: { audience, type, title }
    });

    res.status(201).json({ success: true, message: 'Broadcast notification sent successfully', notification });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error sending notification' });
  }
};

export const deleteNotificationRecord = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: 'Notification record deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error deleting record' });
  }
};

// --- Advanced Analytics & Reports ---

export const getAdvancedAnalytics = async (req, res) => {
  try {
    const last12Months = new Date();
    last12Months.setMonth(last12Months.getMonth() - 11);
    last12Months.setDate(1);
    last12Months.setHours(0, 0, 0, 0);

    // 1. Monthly Revenue & Booking Growth
    const monthlyStats = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: last12Months },
          status: { $nin: ['failed'] }
        }
      },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" }
          },
          revenue: { $sum: "$totalPrice" },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // 2. Booking Status Distribution
    const statusStats = await Booking.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    // 3. City-wise Booking Distribution
    const cityStats = await Booking.aggregate([
      {
        $lookup: {
          from: "properties",
          localField: "hotelId",
          foreignField: "_id",
          as: "property"
        }
      },
      { $unwind: "$property" },
      {
        $group: {
          _id: "$property.city",
          totalBookings: { $sum: 1 },
          revenue: { $sum: "$totalPrice" }
        }
      },
      { $sort: { totalBookings: -1 } },
      { $limit: 10 }
    ]);

    // 4. User vs Partner Growth
    const userGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: last12Months } } },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
            role: "$role"
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    res.status(200).json({
      success: true,
      monthly: monthlyStats,
      distribution: statusStats,
      cities: cityStats,
      growth: userGrowth
    });
  } catch (error) {
    console.error('Analytics Error:', error);
    res.status(500).json({ success: false, message: 'Server error generating analytics' });
  }
};

export const exportBookingsCSV = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('userId', 'name email phone')
      .populate('hotelId', 'name city')
      .sort({ createdAt: -1 });

    let csv = 'BookingID,Date,Customer,Email,Phone,Property,City,Amount,Status\n';

    bookings.forEach(b => {
      const date = new Date(b.createdAt).toLocaleDateString();
      const row = [
        b.bookingId,
        date,
        b.userId?.name || 'N/A',
        b.userId?.email || 'N/A',
        b.userId?.phone || 'N/A',
        b.hotelId?.name || 'N/A',
        b.hotelId?.city || 'N/A',
        b.totalPrice,
        b.status
      ].map(val => `"${val}"`).join(',');
      csv += row + '\n';
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=rukkoin-bookings-report.csv');
    res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error exporting CSV' });
  }
};

// --- Staff Management (Superadmin only) ---

export const getAllStaff = async (req, res) => {
  try {
    const staff = await Admin.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, staff });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching staff' });
  }
};

export const createStaff = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    const existing = await Admin.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'Account already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newStaff = await Admin.create({
      name,
      email,
      password: hashedPassword,
      role,
      phone
    });

    // Log staff creation
    await logAuditAction({
      adminId: req.user.id,
      action: 'STAFF_CREATED',
      description: `New staff account created: ${name} (${role})`,
      targetType: 'Admin',
      targetId: newStaff._id,
      req,
      metadata: { staffEmail: email, staffRole: role }
    });

    res.status(201).json({ success: true, message: 'Staff account created', staff: newStaff });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating staff account' });
  }
};

export const updateStaffStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive, role } = req.body;

    const staff = await Admin.findByIdAndUpdate(id, { isActive, role }, { new: true });
    if (!staff) return res.status(404).json({ success: false, message: 'Staff not found' });

    res.status(200).json({ success: true, message: 'Staff updated', staff });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating staff' });
  }
};

export const deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const staff = await Admin.findById(id);
    if (staff.role === 'superadmin') {
      return res.status(403).json({ success: false, message: 'Superadmin cannot be deleted' });
    }

    const staffName = staff.name;
    const staffRole = staff.role;

    await Admin.findByIdAndDelete(id);

    // Log staff deletion
    await logAuditAction({
      adminId: req.user.id,
      action: 'STAFF_DELETED',
      description: `Staff account deleted: ${staffName} (${staffRole})`,
      targetType: 'Admin',
      targetId: id,
      req,
      metadata: { deletedStaffName: staffName, deletedStaffRole: staffRole }
    });

    res.status(200).json({ success: true, message: 'Staff account deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting staff' });
  }
};






// --- Security & Audit ---
export const getAuditLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.action) query.action = req.query.action;
    if (req.query.targetType) query.targetType = req.query.targetType;
    if (req.query.adminId) query.admin = req.query.adminId;

    const logs = await AuditLog.find(query)
      .populate('admin', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await AuditLog.countDocuments(query);

    res.status(200).json({
      success: true,
      logs,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching audit logs' });
  }
};
