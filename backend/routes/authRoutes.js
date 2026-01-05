import express from 'express';
import { sendOtp, verifyOtp, verifyPartnerOtp, adminLogin, getMe } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/partner/verify-otp', verifyPartnerOtp);
router.post('/admin/login', adminLogin);
router.get('/me', protect, getMe);


export default router;
