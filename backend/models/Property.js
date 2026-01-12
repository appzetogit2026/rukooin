import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  propertyType: {
    type: String,
    enum: ['Hotel', 'Villa', 'Resort', 'Homestay', 'Hostel', 'PG'],
    required: true
  },
  // Basic Info
  name: {
    type: String,
    trim: true
  },
  shortDescription: String,
  description: String,

  // Location
  address: {
    addressLine: String,
    street: String,
    area: String,
    landmark: String,
    city: String,
    state: String,
    pincode: String,
    zipCode: String,
    country: { type: String, default: 'India' }
  },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number] // [lng, lat]
  },

  // Media
  images: {
    cover: String,
    gallery: [String]
  },

  // Status & Metadata
  status: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'rejected'],
    default: 'draft'
  },
  isLive: {
    type: Boolean,
    default: false
  },

  // Aggregates (Updated via triggers or periodically)
  rating: { type: Number, default: 3 },
  numReviews: { type: Number, default: 0 },
  minPrice: { type: Number, default: 0 } // For simplified querying

}, { timestamps: true });

propertySchema.index({ location: '2dsphere' });

export default mongoose.model('Property', propertySchema);
