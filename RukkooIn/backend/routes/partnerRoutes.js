import express from 'express';
import { protect, authorizedRoles } from '../middlewares/authMiddleware.js';
import {
  getPartnerNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotifications
} from '../controllers/partnerController.js';

const router = express.Router();

router.use(protect);
router.use(authorizedRoles('partner', 'admin'));

// Notification Routes
router.get('/notifications', getPartnerNotifications);
router.put('/notifications/read-all', markAllNotificationsRead);
router.put('/notifications/:id/read', markNotificationRead);
router.delete('/notifications', deleteNotifications);

export default router;
