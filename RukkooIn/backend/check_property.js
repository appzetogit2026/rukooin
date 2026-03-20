import mongoose from 'mongoose';
import Property from './models/Property.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkProperty() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    const partnerId = '69830fa741d5e4217950d381';
    const properties = await Property.find({ partnerId });
    console.log('Properties for Partner:', JSON.stringify(properties, null, 2));
    await mongoose.disconnect();
  } catch (error) {
    console.error(error);
  }
}

checkProperty();
