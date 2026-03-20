import mongoose from 'mongoose';
import Property from './models/Property.js';
import dotenv from 'dotenv';

dotenv.config();

async function listAllProperties() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    
    console.log('--- ALL PROPERTIES ---');
    const properties = await Property.find({}).select('propertyName partnerId status').lean();
    for (const p of properties) {
      console.log(`- ${p.propertyName} | Partner: ${p.partnerId} | Status: ${p.status}`);
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error(error);
  }
}

listAllProperties();
