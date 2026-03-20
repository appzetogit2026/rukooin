import mongoose from 'mongoose';
import Partner from './models/Partner.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkPartnerById() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    
    const partnerId = new mongoose.Types.ObjectId('6999abc21434ee2f4f280441');
    const partner = await Partner.findById(partnerId);
    if (partner) {
        console.log('Partner Found:', partner.name);
        console.log('Email:', partner.email);
        console.log('Phone:', partner.phone);
    } else {
        console.log('Partner NOT Found');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error(error);
  }
}

checkPartnerById();
