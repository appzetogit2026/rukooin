import mongoose from 'mongoose';
import Property from './models/Property.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkOrphanedProperties() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    
    console.log('--- PROPERTIES WITHOUT PARTNER ID ---');
    const properties = await Property.find({ 
      $or: [
        { partnerId: { $exists: false } },
        { partnerId: null }
      ]
    }).lean();
    
    for (const p of properties) {
      console.log(`- ${p.propertyName} (ID: ${p._id}) Status: ${p.status}`);
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error(error);
  }
}

checkOrphanedProperties();
