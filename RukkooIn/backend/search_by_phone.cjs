
const mongoose = require('mongoose');

// Define models
const bookingSchema = new mongoose.Schema({
  guestDetails: { phone: String },
  bookingId: String,
  bookingStatus: String,
  paymentStatus: String,
  createdAt: Date
}, { strict: false });
const Booking = mongoose.model('Booking', bookingSchema, 'bookings');

async function searchByPhone() {
  const mongoUrl = "mongodb+srv://rukkooin:rukkooin@cluster0.6mzfrnp.mongodb.net/?appName=Cluster0";
  await mongoose.connect(mongoUrl);
  
  const phone = "9589814119";
  const bookings = await Booking.find({ 
    "guestDetails.phone": phone 
  }).sort({ createdAt: -1 }).lean();
  
  console.log(`Found ${bookings.length} bookings for phone ${phone}:`);
  bookings.forEach(b => {
    console.log(`- ${b.bookingId} (${b._id}): Status: ${b.bookingStatus}, Payment: ${b.paymentStatus}, Created: ${b.createdAt}`);
    console.log(`  Dates: ${b.checkIn} to ${b.checkOut}, PropertyId: ${b.propertyId}`);
  });

  await mongoose.disconnect();
}
searchByPhone();
