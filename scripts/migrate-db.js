const { MongoClient } = require('mongodb');

const sourceUri = 'mongodb://Technova:vivekVOra32%2B@69.62.80.180:27017/stylehub?authSource=admin';
const targetUri = 'mongodb+srv://Vercel-Admin-onestop:TxUKlyeG9NHw0fRU@onestop.usiqfgn.mongodb.net/?retryWrites=true&w=majority';
const dbName = 'stylehub';

async function migrateDatabase() {
  let sourceClient, targetClient;
  
  try {
    console.log('Connecting to source database...');
    sourceClient = new MongoClient(sourceUri);
    await sourceClient.connect();
    
    console.log('Connecting to target database...');
    targetClient = new MongoClient(targetUri);
    await targetClient.connect();
    
    const sourceDb = sourceClient.db(dbName);
    const targetDb = targetClient.db(dbName);
    
    // Get all collections
    const collections = await sourceDb.listCollections().toArray();
    console.log(`Found ${collections.length} collections to migrate`);
    
    for (const collection of collections) {
      const collectionName = collection.name;
      console.log(`Migrating collection: ${collectionName}`);
      
      const sourceCollection = sourceDb.collection(collectionName);
      const targetCollection = targetDb.collection(collectionName);
      
      // Clear target collection if exists (keeps source intact)
      try {
        await targetCollection.deleteMany({});
        console.log(`Cleared existing data in ${collectionName}`);
      } catch (error) {
        // Collection doesn't exist, continue
      }
      
      // Get all documents
      const documents = await sourceCollection.find({}).toArray();
      
      if (documents.length > 0) {
        await targetCollection.insertMany(documents);
        console.log(`✓ Migrated ${documents.length} documents to ${collectionName}`);
      } else {
        console.log(`✓ Collection ${collectionName} is empty`);
      }
    }
    
    console.log('Migration completed successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    if (sourceClient) await sourceClient.close();
    if (targetClient) await targetClient.close();
  }
}

migrateDatabase();