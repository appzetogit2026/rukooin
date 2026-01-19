
import mongoose from 'mongoose';
// Fix path: check_offer_debug.js is in root, so backend is ./backend
// But node module resolution can be tricky with ESM if not configured in package.json.
// Let's assume absolute or simple relative works if we don't rely on package.json details or just give file extension.

// Re-defining schema inline to avoid import issues if possible, or just trying correct relative path.
// The file is at c:\Users\91998\OneDrive\Desktop\AppZeto\rukkoin\check_offer_debug.js
// Models are at c:\Users\91998\OneDrive\Desktop\AppZeto\rukkoin\backend\models

// Let's try to just use valid relative path.
import Offer from './backend/models/Offer.js';
import dotenv from 'dotenv';

dotenv.config({ path: './backend/.env' });

const checkOffer = async () => {
  try {
    console.log('Connecting...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/rukkoin');
    console.log('Connected to DB');

    const offer = await Offer.findOne({ code: 'WINTER15' });
    if (offer) {
      console.log('Offer Code:', offer.code);
      console.log('Offer EndDate (Raw):', offer.endDate);
      const now = new Date();
      console.log('Server Now:', now);

      if (offer.endDate) {
        const expiry = new Date(offer.endDate);
        expiry.setHours(23, 59, 59, 999);
        console.log('Expiry:', expiry);
        console.log('Check -> expiry < now:', expiry < now);
      }
    } else {
      console.log('Offer WINTER15 not found');
    }
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
};

checkOffer();
