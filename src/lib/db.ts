import { MongoClient, Db, Collection, IndexSpecification } from "mongodb";

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

async function createIndexes(collection: Collection, indexes: { keys: IndexSpecification, options?: any }[]) {
  try {
    for (const { keys, options } of indexes) {
      await collection.createIndex(keys, options);
    }
  } catch (error) {
    console.error('Error occurred while creating indexes:', error);
  }
}

export async function getDb(): Promise<Db> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");

  if (cachedDb && cachedClient) return cachedDb;

  const client = new MongoClient(uri, {
    maxPoolSize: 10,
  });
  
  await client.connect();
  const dbName = process.env.MONGODB_DB || new URL(uri).pathname.replace(/^\//, "") || "app";
  const db = client.db(dbName);
  
  const licensesCollection = db.collection('licenses');
  await createIndexes(licensesCollection, [
    { keys: { key: 1 }, options: { unique: true } },
    { keys: { ownerId: 1 } },
    { keys: { appId: 1 } },
    { keys: { status: 1 } },
    { keys: { expiresAt: 1 }, options: { expireAfterSeconds: 0 } }
  ]);
  
  cachedClient = client;
  cachedDb = db;
  return db;
}
