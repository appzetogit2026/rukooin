import express from 'express';
import { getHotelReviews, createReview } from '../controllers/reviewController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/:hotelId', getHotelReviews);
router.post('/', protect, createReview);

export default router;
