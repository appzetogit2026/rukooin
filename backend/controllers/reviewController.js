import Review from '../models/Review.js';
import Property from '../models/Property.js';
import mongoose from 'mongoose';

export const getPropertyReviews = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const reviews = await Review.find({ propertyId, status: 'approved' })
      .populate('userId', 'name') // Assuming User model has 'name' field
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const createReview = async (req, res) => {
  try {
    const { propertyId, bookingId, rating, comment } = req.body;

    // Create the review
    const review = await Review.create({
      userId: req.user._id,
      propertyId,
      bookingId,
      rating,
      comment,
      status: 'approved'
    });

    // Calculate new stats
    const stats = await Review.aggregate([
      {
        $match: { propertyId: new mongoose.Types.ObjectId(propertyId), status: 'approved' }
      },
      {
        $group: {
          _id: '$propertyId',
          avgRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    // Update Property
    if (stats.length > 0) {
      await Property.findByIdAndUpdate(propertyId, {
        avgRating: Math.round(stats[0].avgRating * 10) / 10, // Round to 1 decimal
        totalReviews: stats[0].totalReviews
      });
    } else {
      // Fallback for first review (should be covered by aggregation but safe to have)
      await Property.findByIdAndUpdate(propertyId, {
        avgRating: rating,
        totalReviews: 1
      });
    }

    res.status(201).json(review);
  } catch (e) {
    console.error("Review Submission Error:", e);
    res.status(500).json({ message: e.message });
  }
};
