
import mongoose from 'mongoose';
import 'dotenv/config';

const bookingSchema = new mongoose.Schema({
  bookingId: String,
  bookingStatus: String,
  cancelledAt: Date,
  cancellationReason: String
}, { timestamps: true });

const Booking = mongoose.model('Booking', bookingSchema);

const availabilityLedgerSchema = new mongoose.Schema({
  source: String,
  referenceId: mongoose.Schema.Types.ObjectId
});

const AvailabilityLedger = mongoose.model('AvailabilityLedger', availabilityLedgerSchema);

async function cancelGhostBooking() {
  try {
    const mongoUrl = "mongodb+srv://rukkooin:rukkooin@cluster0.6mzfrnp.mongodb.net/?appName=Cluster0";
    await mongoose.connect(mongoUrl);

    const bookingId = 'BK-1774234544365-865';
    const booking = await Booking.findOne({ bookingId });

    if (!booking) {
      console.log(`Booking ${bookingId} not found.`);
      await mongoose.disconnect();
      return;
    }

    console.log(`Found booking: ${booking._id} (Status: ${booking.bookingStatus})`);

    // 1. Update Booking Status
    booking.bookingStatus = 'cancelled';
    booking.cancelledAt = new Date();
    booking.cancellationReason = 'Ghost booking cleared by Admin (manual script)';
    await booking.save();
    console.log('Booking status updated to cancelled.');

    // 2. Clear Inventory Ledger
    const delResult = await AvailabilityLedger.deleteMany({
      referenceId: booking._id
    });
    console.log(`Deleted ${delResult.deletedCount} ledger entries.`);

    console.log('SUCCESS: Dates released for SS Villa.');
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error during cancellation:', err);
  }
}

cancelGhostBooking();
