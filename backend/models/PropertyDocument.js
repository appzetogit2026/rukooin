// models/PropertyDocument.js
import mongoose from "mongoose";

const propertyDocumentSchema = new mongoose.Schema({

  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Property",
    required: true
  },

  propertyType: {
    type: String,
    enum: ["villa", "resort", "hotel", "hostel", "pg", "homestay"],
    required: true
  },

  documents: [{
    name: String,            // Trade License, FSSAI, Rent Agreement
    fileUrl: String,
    isRequired: Boolean
  }],

  verificationStatus: {
    type: String,
    enum: ["pending", "verified", "rejected"],
    default: "pending"
  },

  adminRemark: String,

  verifiedAt: Date

}, { timestamps: true });

export default mongoose.model("PropertyDocument", propertyDocumentSchema);
