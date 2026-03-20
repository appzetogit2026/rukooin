import mongoose from 'mongoose';
import Partner from './models/Partner.js';
import dotenv from 'dotenv';

dotenv.config();

async function searchParadisePartner() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    
    console.log('--- PARTNERS WITH "PARADISE" ---');
    const partners = await Partner.find({ name: { $regex: 'Paradise', $options: 'i' } });
    for (const p of partners) {
      console.log(`- ${p.name} (ID: ${p._id}) Email: ${p.email} Phone: ${p.phone}`);
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error(error);
  }
}

searchParadisePartner();
