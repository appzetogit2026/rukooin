import { MongoClient } from 'mongodb';

async function main() {
  const uri = "mongodb+srv://rukkooin:rukkooin@cluster0.6mzfrnp.mongodb.net/?appName=Cluster0";
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("test"); // Mongoose default db is sometimes 'test' for Atlas if not specified in URI!
    
    // Let's check both 'test' and 'rukooin' DBs
    let settings = await db.collection('platformsettings').find({}).toArray();
    
    if (settings.length === 0) {
      const db2 = client.db("rukooin");
      settings = await db2.collection('platformsettings').find({}).toArray();
    }
    
    console.log("TOTAL SETTINGS DOCS:", settings.length);
    console.log(JSON.stringify(settings, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

main().catch(console.error);
