import mongoose from 'mongoose';
import Booking from './models/Booking.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkTodayBookings() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    
    const propertyId = new mongoose.Types.ObjectId('6992df9c2c4b3a1b714eaeed');
    const today = new Date('2026-03-20').toISOString().split('T')[0];
    
    const bookings = await Booking.find({ propertyId });
    console.log(`--- BOOKINGS FOR PROPERTY ${propertyId} ---`);
    for (const b of bookings) {
        const ci = b.checkInDate.toISOString().split('T')[0];
        console.log(`- Booking ${b.bookingId} Check-In: ${ci} Status: ${b.bookingStatus} Guest: ${b.userId}`);
        if (ci === today && b.bookingStatus === 'confirmed') {
            console.log('  *** TODAY\'S CONFIRMED CHECK-IN! ***');
        }
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error(error);
  }
}

checkTodayBookings();
