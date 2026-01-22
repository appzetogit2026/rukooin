import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    unique: true,
    sparse: true, // Allows null/undefined values to duplicate (i.e., multiple users without email)
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  // Removed password field as we are using OTP based auth primarily, 
  // but if needed for future email/pass, we can keep it. 
  // Based on current authController, it seems password is NOT used (OTP only).
  // The previous User model had 'password' required, but authController didn't seem to use it for login?
  // Let's check authController again. It generates OTP. 
  // Wait, the previous model had `password: { type: String, required: true }`.
  // If the user was signing up with OTP, how was password set?
  // Let's check `authController.js` register logic.
  
  role: {
    type: String,
    default: 'user',
    immutable: true
  },
  
  fcmToken: {
    type: String,
    default: null
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  savedHotels: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property'
  }],
  address: {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    zipCode: { type: String, trim: true },
    country: { type: String, default: 'India', trim: true },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  termsAccepted: { type: Boolean, default: false },

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
  isSuspicious: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;
