
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config(); // Load .env from current dir

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Connected to DB");

    console.log("Checking collections...");
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("Collections found:", collections.map(c => c.name));

    // Let's assume the collection name is 'roomtypes' or 'roomTypes' based on the list
    // Try the aggregation
    const Property = mongoose.connection.collection('properties');

    // Find one property ID to test
    const oneProp = await Property.findOne();
    if (!oneProp) {
      console.log("No properties found.");
      return;
    }
    console.log("Testing with Property ID:", oneProp._id);

    const result = await Property.aggregate([
      { $match: { _id: oneProp._id } },
      {
        $lookup: {
          from: 'roomtypes', // Try default first
          localField: '_id',
          foreignField: 'propertyId',
          as: 'roomTypes_default'
        }
      },
      // Try another case if possible?
      {
        $lookup: {
          from: 'RoomTypes',
          localField: '_id',
          foreignField: 'propertyId',
          as: 'roomTypes_Pascal'
        }
      },
      {
        $lookup: {
          from: 'roomTypes',
          localField: '_id',
          foreignField: 'propertyId',
          as: 'roomTypes_camel'
        }
      }
    ]).toArray();

    console.log("Aggregation Result:", JSON.stringify(result, null, 2));

    // Also check if any RoomType actually exists for this property
    const RoomTypeColl = mongoose.connection.collection('roomtypes');
    const rt = await RoomTypeColl.find({ propertyId: oneProp._id }).toArray();
    console.log("Direct RoomType Query count:", rt.length);
    if (rt.length > 0) {
      console.log("Sample RoomType:", JSON.stringify(rt[0], null, 2));
    }

  } catch (e) {
    console.error(e);
  } finally {
    await mongoose.disconnect();
  }
};

run();
