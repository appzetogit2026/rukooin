import mongoose from 'mongoose';
import Property from './models/Property.js';
import Booking from './models/Booking.js';
import dotenv from 'dotenv';

dotenv.config();

async function simulatePartnerBookings() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    
    const partnerId = new mongoose.Types.ObjectId('6992d5672c4b3a1b714ea954');
    
    // 1. Get Properties
    const properties = await Property.find({ partnerId }).select('_id propertyName status');
    console.log('--- PROPERTIES FOUND ---');
    console.log(properties);
    
    if (properties.length === 0) {
        console.log('No properties found for this partner ID');
        await mongoose.disconnect();
        return;
    }

    const propertyIds = properties.map(p => p._id);
    
    // 2. Get Bookings (All statuses)
    const bookings = await Booking.find({ propertyId: { $in: propertyIds } });
    console.log('--- BOOKINGS FOUND ---');
    console.log(`Count: ${bookings.length}`);
    
    // 3. Check statuses
    const statusCounts = {};
    bookings.forEach(b => {
        statusCounts[b.bookingStatus] = (statusCounts[b.bookingStatus] || 0) + 1;
    });
    console.log('Status Counts:', statusCounts);

    await mongoose.disconnect();
  } catch (error) {
    console.error(error);
  }
}

simulatePartnerBookings();
