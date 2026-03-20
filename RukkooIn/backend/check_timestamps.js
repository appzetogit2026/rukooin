import mongoose from 'mongoose';
import Property from './models/Property.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkTimestamps() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    
    const property = await Property.findOne({ propertyName: { $regex: 'Paradise', $options: 'i' } });
    if (property) {
      console.log('Property ID:', property._id);
      console.log('Created At:', property.getTimestamp());
      console.log('Model createdAt:', property.createdAt);
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error(error);
  }
}

checkTimestamps();
