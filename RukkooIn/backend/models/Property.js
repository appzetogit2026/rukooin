// models/Property.js
import mongoose from "mongoose";

const nearbyPlaceSchema = new mongoose.Schema({
  name: String,
  type: {
    type: String,
    // enum removed to allow flexibilty (bus_stop, restaurant, other, etc.)
  },
  distanceKm: Number
});

const propertySchema = new mongoose.Schema({

  // BASIC INFO
  propertyName: { type: String, required: true },
  propertyType: {
    type: String,
    enum: ["villa", "resort", "hotel", "hostel", "pg", "homestay"],
    required: true
  },

  pgType: {
    type: String,
    enum: ["boys", "girls", "unisex"]
  },

  hostLivesOnProperty: { type: Boolean, default: false },
  familyFriendly: { type: Boolean, default: false },

  resortType: {
    type: String,
    enum: ["beach", "hill", "jungle", "desert"]
  },
  activities: [String],

  description: String,
  shortDescription: String,

  // OWNER
  partnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Partner",
    required: true
  },

  // LOCATION
  address: {
    country: String,
    state: String,
    city: String,
    area: String,
    fullAddress: String,
    pincode: String
  },

  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: [Number]
  },

  nearbyPlaces: {
    type: [nearbyPlaceSchema],
    default: []
  },

  // MEDIA
  coverImage: { type: String, required: true },
  propertyImages: [String],

  // AMENITIES (PROPERTY LEVEL)
  amenities: [String],

  // POLICIES
  checkInTime: String,
  checkOutTime: String,
  cancellationPolicy: String,
  houseRules: [String],

  // STATUS
  status: {
    type: String,
    enum: ["draft", "pending", "approved", "rejected"],
    default: "draft"
  },

  isLive: { type: Boolean, default: false },

  // RATINGS
  avgRating: { type: Number, default: 3 },
  totalReviews: { type: Number, default: 0 }

}, { timestamps: true });

propertySchema.index({ location: "2dsphere" });

export default mongoose.model("Property", propertySchema);
