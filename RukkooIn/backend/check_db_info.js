import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function checkDbName() {
  try {
    const client = await mongoose.connect(process.env.MONGODB_URL);
    console.log('--- DATABASE INFO ---');
    console.log('Database Name:', client.connection.db.databaseName);
    
    // Check counts in this specific DB
    const propertiesCount = await client.connection.db.collection('properties').countDocuments();
    const partnersCount = await client.connection.db.collection('partners').countDocuments();
    const bookingsCount = await client.connection.db.collection('bookings').countDocuments();
    
    console.log('Properties Count:', propertiesCount);
    console.log('Partners Count:', partnersCount);
    console.log('Bookings Count:', bookingsCount);

    await mongoose.disconnect();
  } catch (error) {
    console.error(error);
  }
}

checkDbName();
