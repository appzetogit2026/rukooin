import Review from '../models/Review.js';

export const getPropertyReviews = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const reviews = await Review.find({ propertyId, status: 'approved' }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const createReview = async (req, res) => {
  try {
    const { propertyId, bookingId, rating, comment } = req.body;
    const review = await Review.create({
      userId: req.user._id,
      propertyId,
      bookingId,
      rating,
      comment,
      status: 'approved'
    });
    res.status(201).json(review);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
