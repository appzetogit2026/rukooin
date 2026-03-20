import mongoose from 'mongoose';
import Admin from './models/Admin.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkAdminPhone() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    
    console.log('--- SEARCH ADMIN BY PHONE ---');
    const admin = await Admin.findOne({ phone: '9111485817' }).lean();
    if (admin) {
        console.log(`- ${admin.name} (ID: ${admin._id}) Email: ${admin.email}`);
    } else {
        console.log('Admin NOT Found');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error(error);
  }
}

checkAdminPhone();
