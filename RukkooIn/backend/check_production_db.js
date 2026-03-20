import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function checkProductionDb() {
  try {
    const prodUrl = process.env.MONGODB_URL.replace('.net/?', '.net/rukkoin?');
    console.log('Attempting to connect to:', prodUrl);
    const client = await mongoose.connect(prodUrl);
    console.log('Connected to:', client.connection.db.databaseName);
    
    // Check counts in "rukkoin" DB
    const propertiesCount = await client.connection.db.collection('properties').countDocuments();
    const partnersCount = await client.connection.db.collection('partners').countDocuments();
    const bookingsCount = await client.connection.db.collection('bookings').countDocuments();
    
    console.log('Properties Count:', propertiesCount);
    console.log('Partners Count:', partnersCount);
    console.log('Bookings Count:', bookingsCount);

    await mongoose.disconnect();
  } catch (error) {
    console.error('Failed to connect to rukkoin DB:', error.message);
  }
}

checkProductionDb();
