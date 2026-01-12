import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId
  },
  checkIn: {
    type: Date,
    required: true
  },
  checkOut: {
    type: Date,
    required: true
  },
  guests: {
    rooms: { type: Number, default: 1 },
    adults: { type: Number, default: 1 },
    children: { type: Number, default: 0 }
  },
  // Pricing Breakdown (New Structure)
  pricing: {
    baseAmount: {
      type: Number,
      required: true
    },
    discountAmount: {
      type: Number,
      default: 0
    },
    userPayableAmount: {
      type: Number,
      required: true
    },
    adminCommissionRate: {
      type: Number,
      default: 10 // percentage
    },
    adminCommissionOnBase: {
      type: Number,
      required: true
    },
    partnerEarning: {
      type: Number,
      required: true
    },
    adminNetEarning: {
      type: Number,
      required: true // Can be negative!
    }
  },

  // Coupon Details
  couponApplied: {
    code: {
      type: String,
      uppercase: true
    },
    discountType: {
      type: String,
      enum: ['percentage', 'flat']
    },
    discountValue: Number,
    discountAmount: Number
  },

  // Legacy fields for backward compatibility
  couponCode: {
    type: String,
    uppercase: true
  },
  discountAmount: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  paymentDetails: {
    transactionId: String,
    method: String
  }
}, { timestamps: true });

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
