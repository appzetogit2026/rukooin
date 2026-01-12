import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },

  // Basic Info
  name: { type: String, required: true }, // e.g. "Deluxe Room", "6 Bed Mixed Dorm"
  type: { type: String, required: true }, // "Room", "Dormitory", "Bed"

  // Stats
  count: { type: Number, default: 1 }, // Number of rooms/dorms
  capacity: { type: Number, default: 2 }, // Guests per room OR Beds per Dorm

  // Pricing
  price: Number, // Normalized per night/month
  monthlyPrice: Number, // Explicit PG

  // Hotel Specific
  roomView: String,
  roomSize: String,
  maxAdults: Number,
  maxChildren: Number,

  // Detailed Pricing
  pricing: {
    basePrice: Number,
    extraAdultPrice: Number,
    extraChildPrice: Number,
    weekendPrice: Number,
    seasonalPrice: Number
  },

  // Hostel Specific
  gender: { type: String, enum: ['Male', 'Female', 'Mixed', 'Any'], default: 'Any' },

  amenities: [String],
  images: [
    {
      url: String,
      caption: String
    }
  ]
}, { timestamps: true });

export default mongoose.model('Inventory', inventorySchema);
