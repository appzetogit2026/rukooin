import express from 'express';
import { getUserProfile, updateUserProfile, toggleSavedHotel } from '../controllers/userController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.post('/saved-hotels/:id', protect, toggleSavedHotel);

export default router;
