import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/stylehub'

// Check if it's an Atlas connection
const isAtlas = uri.includes('mongodb+srv://')

const options = {
  // Use TLS for Atlas connections
  ssl: isAtlas,
  tls: isAtlas,
  serverSelectionTimeoutMS: isAtlas ? 10000 : 1500,
  connectTimeoutMS: isAtlas ? 10000 : 3000,
  socketTimeoutMS: 30000,
  maxPoolSize: 20,
  minPoolSize: 0,
  maxIdleTimeMS: 30000,
  retryWrites: true,
  retryReads: true
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === 'development') {
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect().catch(err => {
      console.error('MongoDB connection error:', err)
      throw err
    })
  }
  clientPromise = globalWithMongo._mongoClientPromise!
} else {
  client = new MongoClient(uri, options)
  clientPromise = client.connect().catch(err => {
    console.error('MongoDB connection error:', err)
    throw err
  })
}

export default clientPromise