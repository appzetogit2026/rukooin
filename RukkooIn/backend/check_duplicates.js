import mongoose from 'mongoose';
import User from './models/User.js';
import Partner from './models/Partner.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkDuplicates() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    
    const phone = '9111485817';
    const email = 'hotelpragyaparadise@gmail.com';

    console.log('--- CHECKING USER COLLECTION ---');
    const userByPhone = await User.findOne({ phone });
    console.log('User by Phone:', userByPhone ? `Found (ID: ${userByPhone._id}, Role: ${userByPhone.role})` : 'Not Found');
    const userByEmail = await User.findOne({ email });
    console.log('User by Email:', userByEmail ? `Found (ID: ${userByEmail._id}, Role: ${userByEmail.role})` : 'Not Found');

    console.log('\n--- CHECKING PARTNER COLLECTION ---');
    const partnerByPhone = await Partner.findOne({ phone });
    console.log('Partner by Phone:', partnerByPhone ? `Found (ID: ${partnerByPhone._id}, Role: ${partnerByPhone.role})` : 'Not Found');
    const partnerByEmail = await Partner.findOne({ email });
    console.log('Partner by Email:', partnerByEmail ? `Found (ID: ${partnerByEmail._id}, Role: ${partnerByEmail.role})` : 'Not Found');

    await mongoose.disconnect();
  } catch (error) {
    console.error(error);
  }
}

checkDuplicates();
