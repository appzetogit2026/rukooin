import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

async function searchHemantUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    
    console.log('--- ALL USERS WITH "HEMANT" ---');
    const users = await User.find({ name: { $regex: 'Hemant', $options: 'i' } });
    for (const u of users) {
      console.log(`- ${u.name} (ID: ${u._id}) Email: ${u.email} Phone: ${u.phone} Role: ${u.role}`);
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error(error);
  }
}

searchHemantUser();
