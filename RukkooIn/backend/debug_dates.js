
import mongoose from 'mongoose';
import Offer from './models/Offer.js';
import dotenv from 'dotenv';

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/rukkoin');

    const codes = ['WINTER15', 'NEWRUKKO'];
    const now = new Date();
    console.log(`SERVER_TIME_ISO: ${now.toISOString()}`);

    for (const code of codes) {
      const offer = await Offer.findOne({ code });
      if (offer) {
        console.log(`CODE: ${code}`);
        console.log(`START: ${offer.startDate ? offer.startDate.toISOString() : 'NULL'}`);
        console.log(`END: ${offer.endDate ? offer.endDate.toISOString() : 'NULL'}`);
      } else {
        console.log(`CODE: ${code} NOT FOUND`);
      }
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
run();
