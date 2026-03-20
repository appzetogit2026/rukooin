import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function checkWallet() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    const db = mongoose.connection.db;
    const wallet = await db.collection('wallets').findOne({ userId: new mongoose.Types.ObjectId('6992d5672c4b3a1b714ea954') });
    
    if (wallet) {
        console.log('--- WALLET FOUND ---');
        console.log(JSON.stringify(wallet, null, 2));
    } else {
        console.log('Wallet NOT Found');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error(error);
  }
}

checkWallet();
