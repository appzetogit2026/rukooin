import mongoose from 'mongoose';
import Booking from './models/Booking.js';
import fs from 'fs';

async function investigate() {
  const mongoUrl = "mongodb+srv://rukkooin:rukkooin@cluster0.6mzfrnp.mongodb.net/?appName=Cluster0";
  try {
    await mongoose.connect(mongoUrl);
    
    const bookingId = 'BK-1773926725681-631';
    const booking = await Booking.findOne({ bookingId: bookingId });
    
    if (booking) {
      const result = {
        bookingId: bookingId,
        checkInDate: booking.checkInDate,
        checkOutDate: booking.checkOutDate,
        checkInISO: booking.checkInDate ? booking.checkInDate.toISOString() : null,
        checkOutISO: booking.checkOutDate ? booking.checkOutDate.toISOString() : null,
        checkInLocal: booking.checkInDate ? booking.checkInDate.toString() : null,
        checkOutLocal: booking.checkOutDate ? booking.checkOutDate.toString() : null,
        createdAt: booking.createdAt
      };
      fs.writeFileSync('investigate_result.json', JSON.stringify(result, null, 2));
      console.log("RESULT_WRITTEN_TO_FILE");
    } else {
       // Search by status or just last item to be helpful
       const latest = await Booking.find().sort({ createdAt: -1 }).limit(1);
       if (latest.length > 0) {
           fs.writeFileSync('investigate_result.json', JSON.stringify({ message: "Booking not found with exact ID", latest: latest[0] }, null, 2));
       } else {
           fs.writeFileSync('investigate_result.json', JSON.stringify({ message: "No bookings found" }, null, 2));
       }
       console.log("RESULT_WRITTEN_TO_FILE");
    }
  } catch (err) {
    console.error("Error:", err);
    fs.writeFileSync('investigate_result.json', JSON.stringify({ error: err.message }, null, 2));
  } finally {
    await mongoose.disconnect();
  }
}

investigate();
