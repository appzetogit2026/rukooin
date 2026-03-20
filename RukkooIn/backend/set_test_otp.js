import mongoose from 'mongoose';
import Partner from './models/Partner.js';
import dotenv from 'dotenv';

dotenv.config();

async function setTestOtp() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    
    const phone = '9111485817';
    // Set OTP valid for 1 hour
    const otp = '123456';
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); 

    const result = await Partner.findOneAndUpdate(
      { phone },
      { 
        otp, 
        otpExpires: expiresAt 
      },
      { new: true }
    );

    if (result) {
      console.log(`Success: OTP for ${phone} set to ${otp}. Expires at: ${expiresAt.toISOString()}`);
    } else {
      console.log(`Error: Partner with phone ${phone} not found.`);
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Failed to set test OTP:', error);
  }
}

setTestOtp();
