import express from 'express';
import { getUserProfile, updateUserProfile, updateFcmToken, getNotifications, markNotificationRead, deleteNotifications, markAllNotificationsRead } from '../controllers/userController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.put('/fcm-token', protect, updateFcmToken);

// Notification Routes
router.get('/notifications', protect, getNotifications);
router.put('/notifications/read-all', protect, markAllNotificationsRead); // Must be before :id
router.put('/notifications/:id/read', protect, markNotificationRead);
router.delete('/notifications', protect, deleteNotifications);

export default router;
