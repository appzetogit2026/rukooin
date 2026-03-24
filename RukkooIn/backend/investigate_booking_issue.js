
import mongoose from 'mongoose';
import 'dotenv/config';
import fs from 'fs';

const bookingSchema = new mongoose.Schema({
  bookingId: String,
  propertyId: mongoose.Schema.Types.ObjectId,
  roomTypeId: mongoose.Schema.Types.ObjectId,
  bookingStatus: String,
  checkInDate: Date,
  checkOutDate: Date
}, { timestamps: true });

const Booking = mongoose.model('Booking', bookingSchema);

const propertySchema = new mongoose.Schema({ propertyName: String });
const Property = mongoose.model('Property', propertySchema);

const availabilityLedgerSchema = new mongoose.Schema({
  propertyId: mongoose.Schema.Types.ObjectId,
  roomTypeId: mongoose.Schema.Types.ObjectId,
  startDate: Date,
  endDate: Date,
  units: Number,
  source: String,
  referenceId: mongoose.Schema.Types.ObjectId
}, { timestamps: true });

const AvailabilityLedger = mongoose.model('AvailabilityLedger', availabilityLedgerSchema);

async function investigate() {
  let output = '';
  const log = (msg) => {
    console.log(msg);
    output += msg + '\n';
  };

  try {
    const mongoUrl = "mongodb+srv://rukkooin:rukkooin@cluster0.6mzfrnp.mongodb.net/?appName=Cluster0";
    await mongoose.connect(mongoUrl);

    log('--- SEARCHING FOR BOOKING ---');
    const booking = await Booking.findOne({ 
      $or: [
        { bookingId: 'BK-1774175446088-224' },
        { _id: '69bfc4d6e2cb24944146d6b6' }
      ]
    });

    if (booking) {
      log('Booking found:');
      log(`ID: ${booking._id}`);
      log(`BookingId: ${booking.bookingId}`);
      log(`Status: ${booking.bookingStatus}`);
      log(`PropertyId: ${booking.propertyId}`);
      log(`RoomTypeId: ${booking.roomTypeId}`);
      log(`Check-In: ${booking.checkInDate}`);
      log(`Check-Out: ${booking.checkOutDate}`);
    } else {
      log('Booking NOT found');
    }

    const villa = await Property.findOne({ propertyName: /S S Villa/i });
    if (!villa) {
       log('SS Villa NOT found');
    } else {
        log('\n--- SS VILLA DETAILS ---');
        log(`ID: ${villa._id}`);

        const start = new Date('2026-03-25');
        const end = new Date('2026-04-05');

        const ledgers = await AvailabilityLedger.find({
          propertyId: villa._id,
          startDate: { $lt: end },
          endDate: { $gt: start }
        });

        log(`\n--- LEDGER ENTRIES (${start.toISOString().split('T')[0]} to ${end.toISOString().split('T')[0]}) ---`);
        if (ledgers.length === 0) {
          log('No ledger entries found for these dates.');
        } else {
          ledgers.forEach(l => {
            log(`- ID: ${l._id}, From: ${l.startDate.toISOString().split('T')[0]}, To: ${l.endDate.toISOString().split('T')[0]}, Units: ${l.units}, Source: ${l.source}, Ref: ${l.referenceId}`);
          });
        }

        const otherBookings = await Booking.find({
            propertyId: villa._id,
            bookingStatus: { $in: ['confirmed', 'checked_in', 'pending', 'awaiting_payment'] },
            checkInDate: { $lt: end },
            checkOutDate: { $gt: start }
        });
        
        log(`\n--- OTHER ACTIVE BOOKINGS (${start.toISOString().split('T')[0]} to ${end.toISOString().split('T')[0]}) ---`);
        if (otherBookings.length === 0) {
            log('No other active bookings found.');
        } else {
            otherBookings.forEach(b => {
                log(`- ${b.bookingId}: Status: ${b.bookingStatus}, Dates: ${b.checkInDate.toISOString().split('T')[0]} to ${b.checkOutDate.toISOString().split('T')[0]}`);
            });
        }
    }

    fs.writeFileSync('investigate_result.txt', output);
    await mongoose.disconnect();
  } catch (err) {
    log('Error: ' + err.stack);
    fs.writeFileSync('investigate_result.txt', output);
  }
}

investigate();
