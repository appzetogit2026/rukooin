// models/RoomType.js
import mongoose from "mongoose";

const roomTypeSchema = new mongoose.Schema({

  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Property",
    required: true
  },

  name: { type: String, required: true },

  inventoryType: {
    type: String,
    enum: ["room", "bed", "entire"],
    required: true
  },

  roomCategory: {
    type: String,
    enum: ["private", "shared", "entire"]
  },

  // CAPACITY
  maxAdults: Number,
  maxChildren: Number,
  bedsPerRoom: Number,
  totalInventory: Number, // rooms / beds count

  // PRICING (ALWAYS PER NIGHT)
  pricePerNight: { type: Number, required: true },
  extraAdultPrice: Number,
  extraChildPrice: Number,

  // MEDIA
  images: {
    type: [String],
    validate: v => v.length >= 4
  },

  amenities: [String],

  isActive: { type: Boolean, default: true }

}, { timestamps: true });

export default mongoose.model("RoomType", roomTypeSchema);
