import User from '../models/User.js';
import InfoPage from '../models/InfoPage.js';
import ContactMessage from '../models/ContactMessage.js';
import PlatformSettings from '../models/PlatformSettings.js';
import Property from '../models/Property.js';
import RoomType from '../models/RoomType.js';
import Booking from '../models/Booking.js';
import PropertyDocument from '../models/PropertyDocument.js';
import Review from '../models/Review.js';
import AvailabilityLedger from '../models/AvailabilityLedger.js';

export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalPartners = await User.countDocuments({ role: 'partner' });
    const totalHotels = await Property.countDocuments();
    const pendingHotels = await Property.countDocuments({ status: 'pending' });
    const totalBookings = await Booking.countDocuments();
    const confirmedBookings = await Booking.countDocuments({ bookingStatus: 'confirmed' });
    const revenueData = await Booking.aggregate([
      { $match: { bookingStatus: { $in: ['confirmed', 'checked_out'] }, paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueData.length ? revenueData[0].total : 0;
    const recentBookings = await Booking.find().sort({ createdAt: -1 }).limit(5);
    const recentPropertyRequests = await Property.find({ status: 'pending' }).sort({ createdAt: -1 }).limit(5);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalPartners,
        totalHotels,
        pendingHotels,
        totalBookings,
        confirmedBookings,
        totalRevenue
      },
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

    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) query.role = role;
    if (status) {
      query.isBlocked = status === 'blocked';
    }
    if (req.query.approvalStatus) {
      query.partnerApprovalStatus = req.query.approvalStatus;
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({ success: true, users, total, page, limit });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching users' });
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
    const { status } = req.query;
    const query = {};
    if (status) query.bookingStatus = status;
    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);
    res.status(200).json({ success: true, bookings, total, page, limit });
  } catch (e) {
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
    const { propertyId, hotelId, status, isLive } = req.body;

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

    const hotel = await Property.findByIdAndUpdate(id, update, { new: true });
    if (!hotel) return res.status(404).json({ success: false, message: 'Property not found' });
    res.status(200).json({ success: true, hotel });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error updating hotel status' });
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
    const { status } = req.query;
    const query = {};
    if (status) query.status = status;
    const total = await Review.countDocuments(query);
    const reviews = await Review.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);
    res.status(200).json({ success: true, reviews, total, page, limit });
  } catch (e) {
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
    const { userId, isBlocked } = req.body;
    const user = await User.findByIdAndUpdate(userId, { isBlocked }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, message: `User ${isBlocked ? 'blocked' : 'unblocked'} successfully`, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating user status' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findByIdAndDelete(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, message: 'User deleted successfully' });
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

    res.status(200).json({ success: true, user, bookings: [] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching user details' });
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
    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.status(200).json({ success: true, booking });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error fetching booking details' });
  }
};

export const updatePartnerApprovalStatus = async (req, res) => {
  try {
    const { userId, status } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid partner approval status' });
    }
    const user = await User.findById(userId);
    if (!user || user.role !== 'partner') {
      return res.status(404).json({ success: false, message: 'Partner not found' });
    }
    user.partnerApprovalStatus = status;
    if (status === 'approved') {
      user.isPartner = true;
      if (!user.partnerSince) {
        user.partnerSince = new Date();
      }
    } else {
      user.isPartner = false;
    }
    await user.save();
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
    const { audience, status } = req.query;

    const query = {};

    if (audience) {
      query.audience = audience;
    }

    if (status) {
      query.status = status;
    }

    const total = await ContactMessage.countDocuments(query);
    const messages = await ContactMessage.find(query)
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

    if (!['new', 'in_progress', 'resolved'].includes(status)) {
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
    const { platformOpen, maintenanceMode, bookingDisabledMessage, maintenanceTitle, maintenanceMessage } = req.body;
    const settings = await PlatformSettings.getSettings();

    if (typeof platformOpen === 'boolean') {
      settings.platformOpen = platformOpen;
    }
    if (typeof maintenanceMode === 'boolean') {
      settings.maintenanceMode = maintenanceMode;
    }
    if (typeof bookingDisabledMessage === 'string') {
      settings.bookingDisabledMessage = bookingDisabledMessage;
    }
    if (typeof maintenanceTitle === 'string') {
      settings.maintenanceTitle = maintenanceTitle;
    }
    if (typeof maintenanceMessage === 'string') {
      settings.maintenanceMessage = maintenanceMessage;
    }

    await settings.save();

    res.status(200).json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating platform settings' });
  }
};
