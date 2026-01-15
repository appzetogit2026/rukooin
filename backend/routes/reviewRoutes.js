import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { getPropertyReviews, createReview } from '../controllers/reviewController.js';

const router = express.Router();

router.get('/:propertyId', getPropertyReviews);
router.post('/', protect, createReview);

export default router;
