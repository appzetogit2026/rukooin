import mongoose from 'mongoose';
import Property from './models/Property.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkHostels() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    
    console.log('--- ALL PROPERTIES WITH "HOSTEL" ---');
    const properties = await Property.find({ propertyName: { $regex: 'Hostel', $options: 'i' } });
    for (const p of properties) {
      console.log(`- ${p.propertyName} (ID: ${p._id}) Partner: ${p.partnerId} Status: ${p.status}`);
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error(error);
  }
}

checkHostels();
