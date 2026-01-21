import express from 'express';
import { sendOtp, verifyOtp, verifyPartnerOtp, adminLogin, getMe, updateProfile, updateAdminProfile, registerPartner, uploadDocs, updateFcmToken } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';
import upload from '../utils/cloudinary.js';

const router = express.Router();

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/partner/register', registerPartner);
router.post('/partner/verify-otp', verifyPartnerOtp);
router.post('/partner/upload-docs', upload.array('files', 5), uploadDocs);

router.post('/admin/login', adminLogin);
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfile);
router.put('/admin/update-profile', protect, updateAdminProfile);
router.put('/update-fcm', protect, updateFcmToken); // New Route

export default router;
