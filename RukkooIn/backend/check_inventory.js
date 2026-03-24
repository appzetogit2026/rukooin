
import mongoose from 'mongoose';
import 'dotenv/config';

const roomTypeSchema = new mongoose.Schema({
  name: String,
  totalInventory: Number,
  inventoryType: String,
  bedsPerRoom: Number
});
const RoomType = mongoose.model('RoomType', roomTypeSchema);

async function checkInventory() {
  try {
    const mongoUrl = "mongodb+srv://rukkooin:rukkooin@cluster0.6mzfrnp.mongodb.net/?appName=Cluster0";
    await mongoose.connect(mongoUrl);

    const rt = await RoomType.findById('69b51e65c7a6a54b1d7e8a68');
    if (rt) {
      console.log(`RoomType: ${rt.name}`);
      console.log(`Total Inventory: ${rt.totalInventory}`);
      console.log(`Inventory Type: ${rt.inventoryType}`);
      console.log(`Beds Per Room: ${rt.bedsPerRoom}`);
    } else {
      console.log('RoomType NOT found');
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
  }
}

checkInventory();
