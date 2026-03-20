import mongoose from 'mongoose';
import Partner from './models/Partner.js';
import dotenv from 'dotenv';

dotenv.config();

async function inspectPartnerRaw() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    
    const partner = await Partner.findOne({ email: 'hotelpragyaparadise@gmail.com' }).lean();
    if (partner) {
        console.log('--- RAW PARTNER DOCUMENT ---');
        console.log(JSON.stringify(partner, null, 2));
    } else {
        console.log('Partner NOT Found');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error(error);
  }
}

inspectPartnerRaw();
