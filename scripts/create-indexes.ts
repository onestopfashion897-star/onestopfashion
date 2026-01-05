import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/stylehub'

async function createIndexes() {
  const client = new MongoClient(uri)
  
  try {
    await client.connect()
    console.log('Connected to MongoDB')
    
    const db = client.db('stylehub')

    console.log('Creating indexes for better performance...')

    // Products indexes
    await db.collection('products').createIndex({ isActive: 1 })
    await db.collection('products').createIndex({ categoryId: 1 })
    await db.collection('products').createIndex({ brandId: 1 })
    await db.collection('products').createIndex({ price: 1 })
    await db.collection('products').createIndex({ featured: 1 })
    await db.collection('products').createIndex({ stock: 1 })
    await db.collection('products').createIndex({ sizes: 1 })
    // Ensure text index exists; if already present with different weights, skip to avoid conflict
    try {
      await db.collection('products').createIndex(
        { name: 'text', description: 'text', tags: 'text' },
        { weights: { name: 10, description: 5, tags: 3 } }
      )
    } catch (err) {
      if (err && (err.code === 85 || err.codeName === 'IndexOptionsConflict')) {
        console.log('Text index already exists with different options; skipping weight update.')
      } else {
        throw err
      }
    }
    await db.collection('products').createIndex({ createdAt: -1 })
    // Compound indexes for common filter paths
    await db.collection('products').createIndex({ isActive: 1, categoryId: 1, createdAt: -1 })
    await db.collection('products').createIndex({ isActive: 1, brandId: 1, createdAt: -1 })
    await db.collection('products').createIndex({ isActive: 1, featured: 1, createdAt: -1 })
    await db.collection('products').createIndex({ isActive: 1, price: 1 })

    // Reviews indexes
    await db.collection('reviews').createIndex({ productId: 1, status: 1, createdAt: -1 })
    
    // Categories indexes
    await db.collection('categories').createIndex({ isActive: 1 })
    await db.collection('categories').createIndex({ slug: 1 }, { unique: true })
    
    // Brands indexes
    await db.collection('brands').createIndex({ isActive: 1 })
    await db.collection('brands').createIndex({ slug: 1 }, { unique: true })
    
    // Orders indexes
    await db.collection('orders').createIndex({ userId: 1 })
    await db.collection('orders').createIndex({ orderId: 1 }, { unique: true })
    await db.collection('orders').createIndex({ orderStatus: 1 })
    await db.collection('orders').createIndex({ createdAt: -1 })
    
    // Users indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true })
    
    // Carts indexes
    await db.collection('carts').createIndex({ userId: 1 }, { unique: true })
    
    // Wishlists indexes
    await db.collection('wishlists').createIndex({ userId: 1, productId: 1 }, { unique: true })

    console.log('✅ All indexes created successfully!')
  } catch (error) {
    console.error('Error creating indexes:', error)
  } finally {
    await client.close()
    console.log('Connection closed')
    process.exit(0)
  }
}

createIndexes()
