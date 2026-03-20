import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkHarshUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    
    console.log('--- USERS WITH "HARSH" ---');
    const users = await User.find({ name: { $regex: 'Harsh', $options: 'i' } });
    for (const u of users) {
      console.log(`- ${u.name} (ID: ${u._id}) Email: ${u.email} Phone: ${u.phone}`);
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error(error);
  }
}

checkHarshUser();
