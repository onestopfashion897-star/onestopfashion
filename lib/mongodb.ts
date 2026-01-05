import { MongoClient } from 'mongodb'

// Default MongoDB URI for development
// Note: 0.0.0.0 is a bind address, not a valid client host.
// Use localhost as a safe default and prefer MONGODB_URI in env.
const DEFAULT_MONGODB_URI = 'mongodb://localhost:27017/stylehub'

const uri = process.env.MONGODB_URI || DEFAULT_MONGODB_URI
const options = {
  // Disable TLS for local development; production should rely on MONGODB_URI
  ssl: false,
  tls: false,
  // Reduce server selection/connection timeouts to avoid long startup delays
  serverSelectionTimeoutMS: 1500,
  connectTimeoutMS: 3000,
  socketTimeoutMS: 30000,
  // Keep pool sizes moderate to avoid resource contention
  maxPoolSize: 20,
  minPoolSize: 0,
  maxIdleTimeMS: 30000,
  retryWrites: true,
  retryReads: true
  // Leave compressors to driver defaults; compression can add CPU overhead for small documents
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise!
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise