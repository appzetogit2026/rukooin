import mongoose from 'mongoose';
import Admin from './models/Admin.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkAdminDuplicate() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    
    const phone = '9111485817';
    const email = 'hotelpragyaparadise@gmail.com';

    console.log('--- CHECKING ADMIN COLLECTION ---');
    const adminByPhone = await Admin.findOne({ phone });
    console.log('Admin by Phone:', adminByPhone ? `Found (ID: ${adminByPhone._id}, Role: ${adminByPhone.role})` : 'Not Found');
    const adminByEmail = await Admin.findOne({ email });
    console.log('Admin by Email:', adminByEmail ? `Found (ID: ${adminByEmail._id}, Role: ${adminByEmail.role})` : 'Not Found');

    await mongoose.disconnect();
  } catch (error) {
    console.error(error);
  }
}

checkAdminDuplicate();
