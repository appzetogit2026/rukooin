import mongoose from 'mongoose';
import Partner from './models/Partner.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkPartnerRole() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    
    const partner = await Partner.findOne({ email: 'hotelpragyaparadise@gmail.com' });
    if (partner) {
      console.log('Partner:', partner.name);
      console.log('Role:', partner.role);
      console.log('Status:', partner.partnerApprovalStatus);
      console.log('isBlocked:', partner.isBlocked);
    } else {
      console.log('Partner not found');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error(error);
  }
}

checkPartnerRole();
