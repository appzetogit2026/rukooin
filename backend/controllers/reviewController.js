import Review from '../models/Review.js';
import Property from '../models/Property.js';

export const getHotelReviews = async (req, res) => {
  try {
    const { hotelId } = req.params;
    const reviews = await Review.find({ hotelId, status: 'approved' })
      .populate('userId', 'name')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    console.error('Get Reviews Error:', error);
    res.status(500).json({ message: 'Server error fetching reviews' });
  }
};

export const createReview = async (req, res) => {
  try {
    const { hotelId, bookingId, rating, comment } = req.body;
    const userId = req.user._id;

    // TODO: Verify booking exists and belongs to user (optional for now)

    const review = new Review({
      userId,
      hotelId,
      bookingId,
      rating,
      comment
    });

    await review.save();
    res.status(201).json(review);
  } catch (error) {
    console.error('Create Review Error:', error);
    res.status(500).json({ message: 'Server error creating review' });
  }
};
