// models/Property.js
import mongoose from "mongoose";

const nearbyPlaceSchema = new mongoose.Schema({
  name: String,
  type: {
    type: String,
    enum: ["airport", "railway", "metro", "hospital", "college", "tourist", "market"]
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

  description: String,
  shortDescription: String,

  // OWNER
  partnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
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
    coordinates: [Number] // [lng, lat]
  },

  nearbyPlaces: [nearbyPlaceSchema],

  // MEDIA
  coverImage: { type: String, required: true },
  propertyImages: [String],

  // AMENITIES
  amenities: [String],

  // PRICING (FOR VILLA / ENTIRE PROPERTY)
  pricePerNight: Number, // REQUIRED FOR VILLA / ENTIRE

  extraAdultPrice: Number,
  extraChildPrice: Number,

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
  avgRating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 }

}, { timestamps: true });

propertySchema.index({ location: "2dsphere" });

export default mongoose.model("Property", propertySchema);
