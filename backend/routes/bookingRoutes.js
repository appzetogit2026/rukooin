import express from 'express';
import { protect, authorizedRoles } from '../middlewares/authMiddleware.js';
import { createBooking, getMyBookings, getPartnerBookings } from '../controllers/bookingController.js';

const router = express.Router();

router.post('/', protect, createBooking);
router.get('/my', protect, getMyBookings);
router.get('/partner', protect, authorizedRoles('partner', 'admin'), getPartnerBookings);

export default router;
