import express from 'express';
import { sendOtp, verifyOtp, verifyPartnerOtp, adminLogin, getMe, updateProfile, updateAdminProfile, registerPartner, uploadDocs, deleteDoc, updateFcmToken } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';
import upload from '../utils/cloudinary.js';

const router = express.Router();

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/partner/register', registerPartner);
router.post('/partner/verify-otp', verifyPartnerOtp);
// Custom error handling for Multer
const uploadMiddleware = (req, res, next) => {
  upload.array('files', 5)(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File is too large. Max limit is 10MB.' });
      }
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

router.post('/partner/upload-docs', uploadMiddleware, uploadDocs);
router.post('/partner/delete-doc', deleteDoc);

router.post('/admin/login', adminLogin);
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfile);
router.put('/admin/update-profile', protect, updateAdminProfile);
router.put('/update-fcm', protect, updateFcmToken); // New Route

export default router;
