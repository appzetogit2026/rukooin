import express from 'express';
import { protect, authorizedRoles } from '../middlewares/authMiddleware.js';
import {
  createBooking,
  getMyBookings,
  getPartnerBookings,
  cancelBooking,
  getPartnerBookingDetail,
  markBookingAsPaid,
  markBookingNoShow
} from '../controllers/bookingController.js';

const router = express.Router();

router.post('/', protect, createBooking);
router.get('/my', protect, getMyBookings);
router.get('/partner', protect, authorizedRoles('partner', 'admin'), getPartnerBookings);
router.get('/:id/partner-detail', protect, authorizedRoles('partner', 'admin'), getPartnerBookingDetail);
router.put('/:id/mark-paid', protect, authorizedRoles('partner', 'admin'), markBookingAsPaid);
router.put('/:id/no-show', protect, authorizedRoles('partner', 'admin'), markBookingNoShow);
router.post('/:id/cancel', protect, cancelBooking);

export default router;
