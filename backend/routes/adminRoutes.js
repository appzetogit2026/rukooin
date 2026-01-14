import express from 'express';
import {
  getDashboardStats,
  getAllUsers,
  getAllHotels,
  getAllBookings,
  getPropertyRequests,
  updateHotelStatus,
  getReviewModeration,
  updateReviewStatus,
  updateUserStatus,
  deleteUser,
  deleteHotel,
  updateBookingStatus,
  getUserDetails,
  getHotelDetails,
  getBookingDetails,
  deleteReview,
  updatePartnerApprovalStatus,
  getLegalPages,
  upsertLegalPage,
  getContactMessages,
  updateContactStatus,
  getPlatformSettings,
  updatePlatformSettings
} from '../controllers/adminController.js';
import { protect, authorizedRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All admin routes are protected and restricted to admin roles
router.use(protect);
router.use(authorizedRoles('admin', 'superadmin'));

router.get('/dashboard-stats', getDashboardStats);
router.get('/users', getAllUsers);
router.get('/hotels', getAllHotels);
router.get('/bookings', getAllBookings);
router.get('/property-requests', getPropertyRequests);
router.put('/update-hotel-status', updateHotelStatus);
router.get('/reviews', getReviewModeration);
router.put('/update-review-status', updateReviewStatus);
router.put('/update-user-status', updateUserStatus);
router.put('/update-partner-approval', updatePartnerApprovalStatus);
router.delete('/delete-user', deleteUser);
router.delete('/delete-hotel', deleteHotel);
router.put('/update-booking-status', updateBookingStatus);
router.get('/user-details/:id', getUserDetails);
router.get('/hotel-details/:id', getHotelDetails);
router.get('/booking-details/:id', getBookingDetails);
router.delete('/delete-review', deleteReview);
router.get('/legal-pages', getLegalPages);
router.post('/legal-pages', upsertLegalPage);
router.get('/contact-messages', getContactMessages);
router.put('/contact-messages/:id/status', updateContactStatus);
router.get('/platform-settings', getPlatformSettings);
router.put('/platform-settings', updatePlatformSettings);

export default router;
