import mongoose from 'mongoose';
import Partner from './models/Partner.js';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkPartner() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('Connected to MongoDB');

    const phone = '9131238398';
    const email = 'nikhilpandit66667@gmail.com';

    console.log(`--- Searching for Phone: ${phone} ---`);
    const partnerByPhone = await Partner.findOne({ phone });
    if (partnerByPhone) {
      console.log('Partner Found by Phone:', JSON.stringify(partnerByPhone, null, 2));
    } else {
      console.log('Partner NOT Found by Phone.');
    }

    console.log(`--- Searching for Email: ${email} ---`);
    const partnerByEmail = await Partner.findOne({ email });
    if (partnerByEmail) {
      console.log('Partner Found by Email:', JSON.stringify(partnerByEmail, null, 2));
    } else {
      console.log('Partner NOT Found by Email.');
    }

    // Also check if they are in the User collection
    console.log('--- Checking User Collection ---');
    const userByPhone = await User.findOne({ phone });
    if (userByPhone) {
        console.log('User Found by Phone:', JSON.stringify(userByPhone, null, 2));
    } else {
        console.log('User NOT Found by Phone.');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkPartner();
