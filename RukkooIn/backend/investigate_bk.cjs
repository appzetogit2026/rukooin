
const mongoose = require('mongoose');

// Define models for deep investigation
const bookingSchema = new mongoose.Schema({}, { strict: false });
const Booking = mongoose.model('Booking', bookingSchema, 'bookings');

const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema, 'users');

async function investigateBooking() {
  const mongoUrl = "mongodb+srv://rukkooin:rukkooin@cluster0.6mzfrnp.mongodb.net/?appName=Cluster0";
  try {
    await mongoose.connect(mongoUrl);
  } catch (err) {
    console.error("Connection failed:", err.message);
    process.exit(1);
  }
  
  const bookingId = 'BK-1773772179592-852';
  const booking = await Booking.findOne({ bookingId }).lean();
  
  if (!booking) {
    console.log(`Error: Booking ${bookingId} not found.`);
    await mongoose.disconnect();
    return;
  }

  console.log('--- BOOKING DETAILS ---');
  console.log(JSON.stringify(booking, null, 2));

  if (booking.userId) {
    const user = await User.findById(booking.userId).lean();
    console.log('\n--- USER DETAILS ---');
    if (user) {
      console.log(JSON.stringify({
        _id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }, null, 2));
    } else {
      console.log('User not found in database.');
    }
  }

  // Check for any other related bookings from the same user or around the same time
  const relatedBookings = await Booking.find({
    userId: booking.userId,
    _id: { $ne: booking._id }
  }).sort({ createdAt: -1 }).limit(5).lean();
  
  if (relatedBookings.length > 0) {
    console.log('\n--- OTHER RECENT BOOKINGS FROM THIS USER ---');
    relatedBookings.forEach(b => {
      console.log(`- ${b.bookingId}: Status ${b.bookingStatus}, Payment ${b.paymentStatus}, Created ${b.createdAt}`);
    });
  }

  await mongoose.disconnect();
}
investigateBooking();
