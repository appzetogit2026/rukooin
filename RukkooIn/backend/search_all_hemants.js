import mongoose from 'mongoose';
import Partner from './models/Partner.js';
import dotenv from 'dotenv';

dotenv.config();

async function searchAllHemants() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    
    console.log('--- ALL PARTNERS WITH "HEMANT" ---');
    const partners = await Partner.find({ name: { $regex: 'Hemant', $options: 'i' } });
    for (const p of partners) {
      console.log(`- ${p.name} (ID: ${p._id}) Email: ${p.email} Phone: ${p.phone}`);
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error(error);
  }
}

searchAllHemants();
