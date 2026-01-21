import mongoose from 'mongoose';

const partnerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  role: {
    type: String,
    default: 'partner',
    immutable: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  
  // Partner Specific Fields
  partnerApprovalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  partnerSince: {
    type: Date,
    default: Date.now
  },
  
  // Business/Legal Details
  panNumber: { type: String, trim: true },
  panCardImage: { type: String }, // URL
  aadhaarNumber: { type: String, trim: true },
  aadhaarFront: { type: String }, // URL
  aadhaarBack: { type: String }, // URL
  
  address: {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    zipCode: { type: String, trim: true },
    country: { type: String, default: 'India', trim: true }
  },

  commissionPercentage: {
    type: Number,
    default: 15,
    min: 0,
    max: 100
  },
  payoutOnHold: {
    type: Boolean,
    default: false
  },

  fcmToken: {
    type: String,
    default: null
  },

  // Auth
  otp: {
    type: String,
    select: false
  },
  otpExpires: {
    type: Date,
    select: false
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  
  // Registration Progress
  registrationStep: {
    type: Number,
    default: 1 // 1: Basic, 2: Docs, 3: Completed
  }

}, { timestamps: true });

const Partner = mongoose.model('Partner', partnerSchema);
export default Partner;
