import express from 'express';
import { createBooking, getMyBookings, getPartnerBookings } from '../controllers/bookingController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createBooking);
router.get('/my-bookings', protect, getMyBookings);
router.get('/partner/all', protect, getPartnerBookings);

export default router;
