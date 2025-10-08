import { MongoClient } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/stylehub'
const DB_NAME = 'stylehub'

interface Product {
  _id: any
  name: string
  sizes: string[]
  stock: number
  sizeStocks?: { size: string; stock: number }[]
}

async function migrateSizeStocks() {
  const client = new MongoClient(MONGODB_URI)
  
  try {
    await client.connect()
    console.log('Connected to MongoDB')
    
    const db = client.db(DB_NAME)
    const productsCollection = db.collection('products')
    
    // Find all products that don't have sizeStocks but have sizes
    const productsToMigrate = await productsCollection.find({
      sizes: { $exists: true, $ne: [] },
      $or: [
        { sizeStocks: { $exists: false } },
        { sizeStocks: { $size: 0 } },
        { sizeStocks: null }
      ]
    }).toArray() as Product[]
    
    console.log(`Found ${productsToMigrate.length} products to migrate`)
    
    let migratedCount = 0
    
    for (const product of productsToMigrate) {
      if (!product.sizes || product.sizes.length === 0) {
        console.log(`Skipping product ${product.name} - no sizes defined`)
        continue
      }
      
      // Distribute total stock evenly across all sizes
      const stockPerSize = Math.floor(product.stock / product.sizes.length)
      const remainderStock = product.stock % product.sizes.length
      
      const sizeStocks = product.sizes.map((size, index) => ({
        size,
        stock: stockPerSize + (index < remainderStock ? 1 : 0)
      }))
      
      // Update the product with sizeStocks
      await productsCollection.updateOne(
        { _id: product._id },
        { 
          $set: { 
            sizeStocks,
            updatedAt: new Date()
          } 
        }
      )
      
      migratedCount++
      console.log(`Migrated product: ${product.name} - distributed ${product.stock} stock across ${product.sizes.length} sizes`)
    }
    
    console.log(`\nMigration completed! Migrated ${migratedCount} products.`)
    
  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  } finally {
    await client.close()
    console.log('Disconnected from MongoDB')
  }
}

// Run the migration
if (require.main === module) {
  migrateSizeStocks()
    .then(() => {
      console.log('Migration script completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Migration script failed:', error)
      process.exit(1)
    })
}

export default migrateSizeStocks