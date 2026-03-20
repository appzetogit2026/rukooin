import mongoose from 'mongoose';
import Partner from './models/Partner.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkRecentPartners() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    console.log('--- RECENT PARTNERS (Last 1 Hour) ---');
    const partners = await Partner.find({ createdAt: { $gte: oneHourAgo } }).lean();
    for (const p of partners) {
      console.log(`- ${p.name} (ID: ${p._id}) Phone: ${p.phone} CreatedAt: ${p.createdAt}`);
    }

    if (partners.length === 0) {
        console.log('No partners registered in the last 1 hour.');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error(error);
  }
}

checkRecentPartners();
