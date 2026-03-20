import mongoose from 'mongoose';
import Partner from './models/Partner.js';
import dotenv from 'dotenv';

dotenv.config();

async function searchParadiseEmail() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    
    console.log('--- PARTNERS WITH "PARADISE" IN EMAIL ---');
    const partners = await Partner.find({ email: { $regex: 'paradise', $options: 'i' } });
    for (const p of partners) {
      console.log(`- ${p.name} (ID: ${p._id}) Email: ${p.email} Phone: ${p.phone}`);
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error(error);
  }
}

searchParadiseEmail();
