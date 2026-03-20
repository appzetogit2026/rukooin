import mongoose from 'mongoose';
import Booking from './models/Booking.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkHarshBookings() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    
    const userId = new mongoose.Types.ObjectId('69bce96dc5067b2149fa7ea0');
    const bookings = await Booking.find({ userId });
    console.log(`--- BOOKINGS FOR HARSH BORASI (User ID: ${userId}) ---`);
    for (const b of bookings) {
        console.log(`- Booking ${b.bookingId} Property: ${b.propertyId} Status: ${b.bookingStatus}`);
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error(error);
  }
}

checkHarshBookings();
