
const mongoose = require('mongoose');

async function checkUserHistory() {
  const mongoUrl = "mongodb+srv://rukkooin:rukkooin@cluster0.6mzfrnp.mongodb.net/?appName=Cluster0";
  await mongoose.connect(mongoUrl);
  
  const userId = "69b99ce7f09340dd0017f724";
  const bookings = await mongoose.model('Booking', new mongoose.Schema({}), 'bookings').find({ userId }).lean();
  
  console.log(`User ${userId} (shalini) has ${bookings.length} total bookings/attempts:`);
  bookings.forEach(b => {
    console.log(`- ${b.bookingId}: Status ${b.bookingStatus}, Payment ${b.paymentStatus}, Created ${b.createdAt}`);
  });

  await mongoose.disconnect();
}
checkUserHistory();
