import mongoose from 'mongoose';
import Property from './models/Property.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkPropertyById() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    
    const propertyId = new mongoose.Types.ObjectId('69aa9805e4a7452122e0bf83');
    const property = await Property.findById(propertyId);
    if (property) {
        console.log('Property Found:', property.propertyName);
        console.log('Partner ID:', property.partnerId);
        console.log('Status:', property.status);
    } else {
        console.log('Property NOT Found');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error(error);
  }
}

checkPropertyById();
