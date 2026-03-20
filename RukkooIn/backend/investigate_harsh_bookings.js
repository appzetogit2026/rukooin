import mongoose from 'mongoose';
import Booking from './models/Booking.js';
import Transaction from './models/Transaction.js';
import User from './models/User.js';
import Wallet from './models/Wallet.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkBookings() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const bookingIds = ['BK-1773988275354-870', 'BK-1773988247094-919'];
    const bookings = await Booking.find({ bookingId: { $in: bookingIds } }).populate('propertyId');

    console.log('--- Booking Details ---');
    for (const booking of bookings) {
      console.log(`Booking ID: ${booking.bookingId}`);
      console.log(`Status: ${booking.bookingStatus}`);
      console.log(`Payment Status: ${booking.paymentStatus}`);
      console.log(`Total Amount: ${booking.totalAmount}`);
      console.log(`Amount Paid: ${booking.amountPaid}`);
      console.log(`Remaining Amount: ${booking.remainingAmount}`);
      console.log(`Payment Method: ${booking.paymentMethod}`);
      console.log(`Payment ID: ${booking.paymentId}`);
      console.log(`Created At: ${booking.createdAt}`);
      console.log('---');
    }

    const transactions = await Transaction.find({ reference: { $in: bookingIds } });
    console.log('--- Transaction Details ---');
    for (const tx of transactions) {
        console.log(`Reference: ${tx.reference}`);
        console.log(`Type: ${tx.type}`);
        console.log(`Category: ${tx.category}`);
        console.log(`Amount: ${tx.amount}`);
        console.log(`Status: ${tx.status}`);
        console.log(`Created At: ${tx.createdAt}`);
        console.log('---');
    }

    // Also check for the user to see if there are other bookings
    const user = await User.findOne({ email: 'harshborasi18@gmail.com' });
    if (user) {
        console.log(`User Found: ${user.name} (${user._id})`);
        const allUserBookings = await Booking.find({ userId: user._id }).sort({ createdAt: -1 });
        console.log(`Total Bookings for User: ${allUserBookings.length}`);
        for (const b of allUserBookings) {
            console.log(`- ${b.bookingId}: ${b.bookingStatus} (${b.paymentStatus})`);
        }
    } else {
        console.log('User not found by email.');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkBookings();
