import express from 'express';
import {
  getDashboardStats,
  getAllUsers,
  getAllHotels,
  getAllBookings,
  getPropertyRequests,
  updateHotelStatus,
  getReviewModeration,
  deleteReview,
  updateReviewStatus,
  updateUserStatus,
  deleteUser,
  getUserDetails,
  updatePartnerApprovalStatus,
  getLegalPages,
  upsertLegalPage,
  getContactMessages,
  updateContactStatus,
  getPlatformSettings,
  updatePlatformSettings,
  verifyPropertyDocuments,
  getHotelDetails,
  getBookingDetails,
  updateBookingStatus,
  deleteHotel,
  updatePartnerSettings,
  updateProperty,
  getPendingVerifications,
  getFinanceData,
  getTransactions,
  processWithdrawal,
  addInternalNote,
  replyToTicket,
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  getFaqs,
  createFaq,
  updateFaq,
  deleteFaq,
  getNotifications,
  sendBroadcastNotification,
  deleteNotificationRecord,
  getAdvancedAnalytics,
  exportBookingsCSV,
  getAllStaff,
  createStaff,
  updateStaffStatus,
  deleteStaff,
  getAuditLogs,
  getPartnerDetails
} from '../controllers/adminController.js';
import { protect, authorizedRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorizedRoles('admin', 'superadmin'));

router.get('/dashboard-stats', getDashboardStats);
router.get('/pending-verifications', getPendingVerifications);
router.get('/users', getAllUsers);
router.get('/hotels', getAllHotels);
router.get('/finance-data', getFinanceData);
router.get('/transactions', getTransactions);
router.post('/process-withdrawal', processWithdrawal);
router.get('/bookings', getAllBookings);
router.get('/property-requests', getPropertyRequests);
router.put('/hotel-status', updateHotelStatus);
router.put('/update-hotel-status', updateHotelStatus);
router.get('/reviews', getReviewModeration);
router.delete('/delete-review', deleteReview);
router.put('/update-review-status', updateReviewStatus);
router.put('/update-user-status', updateUserStatus);
router.put('/update-partner-approval', updatePartnerApprovalStatus);
router.delete('/delete-user', deleteUser);
router.delete('/delete-hotel', deleteHotel);
router.get('/user-details/:id', getUserDetails);
router.get('/partner-details/:id', getPartnerDetails);
router.put('/update-partner-settings', updatePartnerSettings);
router.put('/verify-documents', verifyPropertyDocuments);
router.get('/hotel-details/:id', getHotelDetails);
router.put('/update-property/:id', updateProperty);
router.get('/booking-details/:id', getBookingDetails);
router.put('/booking-status', updateBookingStatus);
router.put('/update-booking-status', updateBookingStatus);
router.get('/legal-pages', getLegalPages);
router.post('/legal-pages', upsertLegalPage);
router.get('/contact-messages', getContactMessages);
router.put('/contact-messages/:id/status', updateContactStatus);
router.post('/contact-messages/:id/notes', addInternalNote);
router.post('/contact-messages/:id/reply', replyToTicket);
router.get('/platform-settings', getPlatformSettings);
router.put('/platform-settings', updatePlatformSettings);

// CMS Routes
router.get('/banners', getBanners);
router.post('/banners', createBanner);
router.put('/banners/:id', updateBanner);
router.delete('/banners/:id', deleteBanner);

router.get('/faqs', getFaqs);
router.post('/faqs', createFaq);
router.put('/faqs/:id', updateFaq);
router.delete('/faqs/:id', deleteFaq);

// Notification Routes
router.get('/notifications', getNotifications);
router.post('/notifications/broadcast', sendBroadcastNotification);
router.delete('/notifications/:id', deleteNotificationRecord);

// Analytics Routes
router.get('/analytics', getAdvancedAnalytics);
router.get('/reports/bookings/export', exportBookingsCSV);

// Staff Management (Superadmin only)
router.get('/staff', protect, authorizedRoles('superadmin'), getAllStaff);
router.post('/staff', protect, authorizedRoles('superadmin'), createStaff);
router.put('/staff/:id', protect, authorizedRoles('superadmin'), updateStaffStatus);
router.delete('/staff/:id', protect, authorizedRoles('superadmin'), deleteStaff);

// Audit Logs (Superadmin only)
router.get('/audit-logs', protect, authorizedRoles('superadmin'), getAuditLogs);

export default router;
