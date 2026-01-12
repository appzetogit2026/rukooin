import mongoose from 'mongoose';
import Property from './Property.js';

const reviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property', // Was Hotel
    required: true
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved'
  }
}, { timestamps: true });

// Static method to calculate average rating
reviewSchema.statics.updateHotelRating = async function (hotelId) {
  const stats = await this.aggregate([
    { $match: { hotelId, status: 'approved' } },
    {
      $group: {
        _id: '$hotelId',
        numReviews: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  if (stats.length > 0) {
    await Property.findByIdAndUpdate(hotelId, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      numReviews: stats[0].numReviews
    });
  } else {
    // If no approved reviews, reset to default 3
    await Property.findByIdAndUpdate(hotelId, {
      rating: 3,
      numReviews: 0
    });
  }
};

// Call updateHotelRating after save
reviewSchema.post('save', function () {
  this.constructor.updateHotelRating(this.hotelId);
});

// Call updateHotelRating after remove
reviewSchema.post('remove', function () {
  this.constructor.updateHotelRating(this.hotelId);
});

const Review = mongoose.model('Review', reviewSchema);
export default Review;

