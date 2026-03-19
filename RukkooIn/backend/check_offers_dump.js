import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function check() {
  try {
    const mongoUri = process.env.MONGODB_URL || 'mongodb+srv://rukkooin:rukkooin@cluster0.6mzfrnp.mongodb.net/?appName=Cluster0';
    await mongoose.connect(mongoUri);
    const db = mongoose.connection.db;
    const offers = await db.collection('offers').find({}).toArray();
    
    // Write full output to file
    import('fs').then(fs => {
        fs.writeFileSync('offers_dump.json', JSON.stringify(offers.map(o => ({
            title: o.title,
            offerType: o.offerType,
            discountValue: o.discountValue
        })), null, 2));
        console.log("DONE");
        process.exit(0);
    });
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
check();
