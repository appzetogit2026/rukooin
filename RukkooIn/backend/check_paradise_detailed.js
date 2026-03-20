import mongoose from 'mongoose';
import Property from './models/Property.js';
import Booking from './models/Booking.js';
import Partner from './models/Partner.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkParadiseDetailed() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    
    console.log('--- ALL PROPERTIES WITH "PARADISE" ---');
    const properties = await Property.find({ propertyName: { $regex: 'Paradise', $options: 'i' } });
    for (const p of properties) {
      console.log(`- ${p.propertyName} (ID: ${p._id}) Partner: ${p.partnerId} Status: ${p.status}`);
    }

    if (properties.length > 0) {
      const partnerId = properties[0].partnerId;
      console.log('\n--- ALL PROPERTIES FOR PARTNER:', partnerId, '---');
      const partnerProps = await Property.find({ partnerId });
      for (const p of partnerProps) {
        console.log(`- ${p.propertyName} (ID: ${p._id}) Status: ${p.status}`);
      }

      const partner = await Partner.findById(partnerId);
      console.log('\n--- PARTNER DETAILS ---');
      console.log(`Name: ${partner?.name}, Email: ${partner?.email}, Phone: ${partner?.phone}, isDeleted: ${partner?.isDeleted}`);
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error(error);
  }
}

checkParadiseDetailed();
