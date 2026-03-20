import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkSampleUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    
    const userId = new mongoose.Types.ObjectId('69bc4249c5067b2149fa1d4b');
    const user = await User.findById(userId);
    if (user) {
        console.log('User Found:', user.name);
        console.log('Phone:', user.phone);
        console.log('Email:', user.email);
    } else {
        console.log('User NOT Found');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error(error);
  }
}

checkSampleUser();
