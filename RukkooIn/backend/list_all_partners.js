import mongoose from 'mongoose';
import Partner from './models/Partner.js';
import dotenv from 'dotenv';

dotenv.config();

async function listAllPartners() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    
    console.log('--- ALL PARTNERS ---');
    const partners = await Partner.find({}).select('name phone email').lean();
    for (const p of partners) {
      console.log(`- ${p.name} | ${p.phone} | ${p.email}`);
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error(error);
  }
}

listAllPartners();
