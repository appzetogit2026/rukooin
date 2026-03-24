
import mongoose from 'mongoose';
import 'dotenv/config';
import fs from 'fs';

const bookingSchema = new mongoose.Schema({
  bookingId: String,
  userId: mongoose.Schema.Types.ObjectId,
  propertyId: mongoose.Schema.Types.ObjectId,
  roomTypeId: mongoose.Schema.Types.ObjectId,
  bookingStatus: String,
  checkInDate: Date,
  checkOutDate: Date,
  paymentMethod: String,
  totalAmount: Number
}, { timestamps: true });

const Booking = mongoose.model('Booking', bookingSchema);

const userSchema = new mongoose.Schema({ name: String, phone: String });
const User = mongoose.model('User', userSchema);

async function investigate() {
  let output = '';
  const log = (msg) => {
    console.log(msg);
    output += msg + '\n';
  };

  try {
    const mongoUrl = "mongodb+srv://rukkooin:rukkooin@cluster0.6mzfrnp.mongodb.net/?appName=Cluster0";
    await mongoose.connect(mongoUrl);

    log('--- INVESTIGATING NEW BOOKING BK-1774234544365-865 ---');
    const b = await Booking.findOne({ bookingId: 'BK-1774234544365-865' }).populate('userId');

    if (b) {
      log(`ID: ${b._id}`);
      log(`Status: ${b.bookingStatus}`);
      log(`Payment Method: ${b.paymentMethod}`);
      log(`Amount: ${b.totalAmount}`);
      log(`Created At: ${b.createdAt}`);
      if (b.userId) {
          log(`User: ${b.userId.name} (${b.userId.phone})`);
      } else {
          log('User NOT found or not populated');
      }
    } else {
      log('Booking BK-1774234544365-865 NOT found');
    }

    fs.writeFileSync('new_booking_details.txt', output);
    await mongoose.disconnect();
  } catch (err) {
    log('Error: ' + err.stack);
    fs.writeFileSync('new_booking_details.txt', output);
  }
}

investigate();
