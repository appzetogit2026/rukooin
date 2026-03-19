import { MongoClient } from 'mongodb';

async function main() {
  const uri = "mongodb://127.0.0.1:27017/";
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("rukooin");
    const collection = db.collection('platformsettings');
    const settings = await collection.find({}).toArray();
    console.log("TOTAL DOCUMENTS:", settings.length);
    console.log(JSON.stringify(settings, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

main().catch(console.error);
