import mongoose from 'mongoose';
import Property from './models/Property.js';
import dotenv from 'dotenv';

dotenv.config();

async function searchAllParadise() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    
    console.log('--- ALL PROPERTY RECORDS WITH "PARADISE" ---');
    const properties = await Property.find({ propertyName: { $regex: 'Paradise', $options: 'i' } });
    for (const p of properties) {
      console.log(`- ${p.propertyName} (ID: ${p._id}) Partner: ${p.partnerId} Status: ${p.status} isLive: ${p.isLive}`);
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error(error);
  }
}

searchAllParadise();
