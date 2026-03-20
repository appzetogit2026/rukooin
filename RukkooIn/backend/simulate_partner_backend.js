import mongoose from 'mongoose';
import Property from './models/Property.js';
import Booking from './models/Booking.js';
import dotenv from 'dotenv';

dotenv.config();

async function simulatePartnerBackend() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    
    const partnerId = new mongoose.Types.ObjectId('6992d5672c4b3a1b714ea954');
    
    // 1. Find properties
    const properties = await Property.find({ partnerId }).select('_id');
    const propertyIds = properties.map(p => p._id);
    console.log('Step 1: Found Properties for Partner:', propertyIds.length);
    console.log('Property IDs:', propertyIds);

    // 2. Find bookings
    const query = { propertyId: { $in: propertyIds } };
    const bookings = await Booking.find(query).sort({ createdAt: -1 });
    console.log('Step 2: Found Bookings for these Properties:', bookings.length);

    if (bookings.length > 0) {
        console.log('Sample Booking Property ID:', bookings[0].propertyId);
        console.log('Query Property ID $in list:', propertyIds.map(id => id.toString()));
        console.log('Comparison:', propertyIds[0].equals(bookings[0].propertyId));
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error(error);
  }
}

simulatePartnerBackend();
