import express from 'express';
import { getUserProfile, updateUserProfile } from '../controllers/userController.js';
import { updateFcmToken } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.put('/fcm-token', protect, updateFcmToken); // Support for Mobile App Endpoint

export default router;
