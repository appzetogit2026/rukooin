
import mongoose from 'mongoose';
import Offer from './models/Offer.js';
import dotenv from 'dotenv';

dotenv.config();

const checkOffer = async () => {
  try {
    console.log('Connecting to Mongo...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/rukkoin');
    console.log('Connected.');

    const codes = ['WINTER15', 'NEWRUKKO'];

    for (const code of codes) {
      const offer = await Offer.findOne({ code });
      if (offer) {
        console.log(`\n--- OFFER: ${code} ---`);
        console.log('StartDate:', offer.startDate);
        console.log('EndDate:', offer.endDate);

        const now = new Date();
        console.log('Server Scan Time:', now);

        if (offer.endDate) {
          const expiry = new Date(offer.endDate);
          // The fix logic
          const expirySet = new Date(expiry);
          expirySet.setHours(23, 59, 59, 999);

          console.log(`EndDate (Raw): ${expiry.toISOString()}`);
          console.log(`EndDate (Fixed): ${expirySet.toISOString()}`);
          console.log(`Expires < Now? : ${expirySet < now}`);
        } else {
          console.log('No End Date (Never Expires)');
        }
      } else {
        console.log(`\nOffer ${code} not found`);
      }
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
};

checkOffer();
