import mongoose from 'mongoose';
import Partner from './models/Partner.js';
import Otp from './models/Otp.js';
import dotenv from 'dotenv';

dotenv.config();

async function setTestOtpEverywhere() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    
    const phone = '9111485817';
    const otp = '123456';
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); 

    // 1. Update Partner
    const partner = await Partner.findOneAndUpdate(
      { phone },
      { otp, otpExpires: expiresAt },
      { new: true }
    );
    if (partner) {
      console.log(`Success: OTP for Partner ${phone} set to ${otp}`);
    } else {
      console.log(`Error: Partner ${phone} not found`);
    }

    // 2. Update Otp collection
    const otpRecord = await Otp.findOneAndUpdate(
      { phone },
      { phone, otp, expiresAt, tempData: { role: 'partner', type: 'login' } },
      { upsert: true, new: true }
    );
    console.log(`Success: OTP for phone ${phone} set in Otp collection to ${otp}`);

    await mongoose.disconnect();
  } catch (error) {
    console.error('Failed to set test OTP everywhere:', error);
  }
}

setTestOtpEverywhere();
