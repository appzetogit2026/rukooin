import mongoose from 'mongoose';
import Property from './models/Property.js';
import dotenv from 'dotenv';

dotenv.config();

async function inspectPropertyRaw() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    
    const property = await Property.findOne({ propertyName: { $regex: 'Paradise', $options: 'i' } }).lean();
    if (property) {
        console.log('--- RAW PROPERTY DOCUMENT ---');
        console.log(JSON.stringify(property, null, 2));
    } else {
        console.log('Property NOT Found');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error(error);
  }
}

inspectPropertyRaw();
