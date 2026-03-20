import mongoose from 'mongoose';
import Property from './models/Property.js';
import Booking from './models/Booking.js';
import Partner from './models/Partner.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkParadise() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    
    // Find property
    const property = await Property.findOne({ propertyName: { $regex: 'Paradise', $options: 'i' } });
    if (!property) {
      console.log('Hotel Paradise not found');
      return;
    }
    console.log('Property Found:', property.propertyName, 'ID:', property._id, 'PartnerID:', property.partnerId, 'Status:', property.status);

    // Find Partner
    const partner = await Partner.findById(property.partnerId);
    console.log('Partner Found:', partner?.name, 'Email:', partner?.email, 'Phone:', partner?.phone);

    // Find Bookings
    const bookings = await Booking.find({ propertyId: property._id });
    console.log('Total Bookings for this property:', bookings.length);
    console.log('Statuses:', bookings.map(b => b.bookingStatus));

    await mongoose.disconnect();
  } catch (error) {
    console.error(error);
  }
}

checkParadise();
