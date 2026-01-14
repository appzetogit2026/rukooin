import User from '../models/User.js';
import Property from '../models/Property.js';
import Booking from '../models/Booking.js';
import Review from '../models/Review.js';
import Inventory from '../models/Inventory.js';
import HotelDetails from '../models/details/HotelDetails.js';
import ResortDetails from '../models/details/ResortDetails.js';
import VillaDetails from '../models/details/VillaDetails.js';
import HomestayDetails from '../models/details/HomestayDetails.js';
import HostelDetails from '../models/details/HostelDetails.js';
import PGDetails from '../models/details/PGDetails.js';

export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalPartners = await User.countDocuments({ role: 'partner' });
    const totalHotels = await Property.countDocuments();
    const pendingHotels = await Property.countDocuments({ status: 'pending' });
    const totalBookings = await Booking.countDocuments();
    const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });

    // Calculate total revenue from confirmed/completed bookings
    const revenueData = await Booking.aggregate([
      { $match: { status: { $in: ['confirmed', 'completed'] }, paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

    // Get recent bookings for dashboard
    const recentBookings = await Booking.find()
      .populate('userId', 'name')
      .populate('hotelId', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get recent property requests
    const recentPropertyRequests = await Property.find({ status: 'pending' })
      .populate('ownerId', 'name email')
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
    const { search, status } = req.query;

    let query = {};
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    if (status) query.status = status;

    const total = await Property.countDocuments(query);
    const hotels = await Property.find(query)
      .populate('ownerId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({ success: true, hotels, total, page, limit });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching hotels' });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { search, status } = req.query;

    let query = {};
    if (search) {
      query.bookingId = { $regex: search, $options: 'i' };
    }
    if (status) query.status = status;

    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate('userId', 'name email phone')
      .populate('hotelId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({ success: true, bookings, total, page, limit });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching bookings' });
  }
};

export const getPropertyRequests = async (req, res) => {
  try {
    const hotels = await Property.find({ status: 'pending' })
      .populate('ownerId', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, hotels });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching property requests' });
  }
};

export const updateHotelStatus = async (req, res) => {
  try {
    const { hotelId, status, isCompanyServiced } = req.body;
    let updateData = {};

    if (status) {
      if (!['approved', 'rejected', 'suspended'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }
      updateData.status = status;
    }

    if (isCompanyServiced !== undefined) {
      updateData.isCompanyServiced = isCompanyServiced;
    }

    const hotel = await Property.findByIdAndUpdate(hotelId, updateData, { new: true });
    if (!hotel) return res.status(404).json({ message: 'Hotel not found' });

    res.status(200).json({ success: true, message: 'Hotel updated successfully', hotel });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating hotel status' });
  }
};

export const getReviewModeration = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { status } = req.query;

    let query = {};
    if (status) query.status = status;

    const total = await Review.countDocuments(query);
    const reviews = await Review.find(query)
      .populate('userId', 'name')
      .populate('hotelId', 'name')
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
    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    const hotelId = review.hotelId;
    await Review.findByIdAndDelete(reviewId);

    // Recalculate rating
    await Review.updateHotelRating(hotelId);

    res.status(200).json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete Review Error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting review' });
  }
};

export const updateReviewStatus = async (req, res) => {
  try {
    const { reviewId, status } = req.body;
    const review = await Review.findByIdAndUpdate(reviewId, { status }, { new: true });
    if (!review) return res.status(404).json({ message: 'Review not found' });

    // Recalculate rating
    await Review.updateHotelRating(review.hotelId);

    res.status(200).json({ success: true, message: `Review status updated to ${status}`, review });
  } catch (error) {
    console.error('Update Review Status Error:', error);
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
    const { hotelId } = req.body;
    const hotel = await Property.findByIdAndDelete(hotelId);
    if (!hotel) return res.status(404).json({ success: false, message: 'Hotel not found' });
    res.status(200).json({ success: true, message: 'Hotel deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error deleting hotel' });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId, status } = req.body;
    const booking = await Booking.findByIdAndUpdate(bookingId, { status }, { new: true });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.status(200).json({ success: true, message: `Booking status updated to ${status}`, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating booking status' });
  }
};

export const getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const bookings = await Booking.find({ userId: id })
      .populate('hotelId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, user, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching user details' });
  }
};

export const getHotelDetails = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid Property ID format' });
    }

    const property = await Property.findById(id).populate('ownerId', 'name email phone');
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });

    // Helper to get correct model
    const getDetailsModel = (type) => {
      const models = {
        'Hotel': HotelDetails,
        'Resort': ResortDetails,
        'Villa': VillaDetails,
        'Homestay': HomestayDetails,
        'Hostel': HostelDetails,
        'PG': PGDetails
      };
      return models[type] || HotelDetails;
    };

    const DetailsModel = getDetailsModel(property.propertyType);
    const details = await DetailsModel.findOne({ propertyId: property._id });
    const inventory = await Inventory.find({ propertyId: property._id });

    // Merge data: property + details + inventory
    const fullData = {
      ...property.toObject(),
      ...(details ? details.toObject() : {}),
      inventory,
      _id: property._id, // Ensure ID is preserved
      propertyId: property._id
    };

    const bookings = await Booking.find({ hotelId: id })
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, hotel: fullData, bookings });
  } catch (error) {
    console.error('Get Hotel Details Admin Error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching hotel details' });
  }
};

export const getBookingDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id)
      .populate('userId', 'name email phone')
      .populate('hotelId', 'name address phone');

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
