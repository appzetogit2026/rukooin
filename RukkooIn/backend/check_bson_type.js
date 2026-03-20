import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function checkBsonType() {
  try {
    const client = await mongoose.connect(process.env.MONGODB_URL);
    const db = client.connection.db;
    const property = await db.collection('properties').findOne({ propertyName: { $regex: 'Paradise', $options: 'i' } });
    
    if (property) {
        console.log('Property ID:', property._id);
        console.log('PartnerID value:', property.partnerId);
        console.log('PartnerID type:', typeof property.partnerId);
        console.log('Is PartnerID ObjectId?', property.partnerId instanceof mongoose.Types.ObjectId);
    } else {
        console.log('Property NOT Found');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error(error);
  }
}

checkBsonType();
