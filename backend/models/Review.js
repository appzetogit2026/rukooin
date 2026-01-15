import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "approved" }
}, { timestamps: true });

export default mongoose.model("Review", reviewSchema);
