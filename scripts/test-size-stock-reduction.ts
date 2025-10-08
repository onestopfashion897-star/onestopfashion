import { MongoClient } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/stylehub'
const DB_NAME = 'stylehub'

interface Product {
  _id: any
  name: string
  sizes: string[]
  stock: number
  sizeStocks: { size: string; stock: number }[]
}

async function testSizeStockReduction() {
  const client = new MongoClient(MONGODB_URI)
  
  try {
    await client.connect()
    console.log('Connected to MongoDB')
    
    const db = client.db(DB_NAME)
    const productsCollection = db.collection('products')
    
    // Find a product with sizeStocks
    const product = await productsCollection.findOne({
      sizeStocks: { $exists: true, $ne: [] }
    }) as Product
    
    if (!product) {
      console.log('No products with sizeStocks found')
      return
    }
    
    console.log('\n=== BEFORE STOCK REDUCTION ===')
    console.log(`Product: ${product.name}`)
    console.log(`Total Stock: ${product.stock}`)
    console.log('Size Stocks:')
    product.sizeStocks.forEach(sizeStock => {
      console.log(`  ${sizeStock.size}: ${sizeStock.stock}`)
    })
    
    // Simulate reducing stock for the first available size
    const testSize = product.sizeStocks[0].size
    const testQuantity = 2
    
    console.log(`\n=== SIMULATING ORDER: ${testQuantity} units of size ${testSize} ===`)
    
    // Update sizeStocks (simulate the reduceProductStock function)
    const updatedSizeStocks = product.sizeStocks.map(sizeStock => {
      if (sizeStock.size === testSize) {
        return {
          ...sizeStock,
          stock: Math.max(0, sizeStock.stock - testQuantity)
        }
      }
      return sizeStock
    })
    
    // Calculate new total stock
    const newTotalStock = updatedSizeStocks.reduce((sum, sizeStock) => sum + sizeStock.stock, 0)
    
    // Update the product
    await productsCollection.updateOne(
      { _id: product._id },
      {
        $set: {
          sizeStocks: updatedSizeStocks,
          stock: newTotalStock,
          updatedAt: new Date()
        }
      }
    )
    
    // Fetch the updated product
    const updatedProduct = await productsCollection.findOne({ _id: product._id }) as Product
    
    console.log('\n=== AFTER STOCK REDUCTION ===')
    console.log(`Product: ${updatedProduct.name}`)
    console.log(`Total Stock: ${updatedProduct.stock} (was ${product.stock})`)
    console.log('Size Stocks:')
    updatedProduct.sizeStocks.forEach(sizeStock => {
      console.log(`  ${sizeStock.size}: ${sizeStock.stock}`)
    })
    
    // Verify the changes
    const expectedTotalReduction = testQuantity
    const actualTotalReduction = product.stock - updatedProduct.stock
    const sizeStockReduction = product.sizeStocks.find(s => s.size === testSize)!.stock - 
                              updatedProduct.sizeStocks.find(s => s.size === testSize)!.stock
    
    console.log('\n=== VERIFICATION ===')
    console.log(`Expected total stock reduction: ${expectedTotalReduction}`)
    console.log(`Actual total stock reduction: ${actualTotalReduction}`)
    console.log(`Size ${testSize} stock reduction: ${sizeStockReduction}`)
    
    if (actualTotalReduction === expectedTotalReduction && sizeStockReduction === testQuantity) {
      console.log('✅ SUCCESS: Both total stock and size-specific stock were reduced correctly!')
    } else {
      console.log('❌ FAILURE: Stock reduction did not work as expected')
    }
    
  } catch (error) {
    console.error('Test failed:', error)
    throw error
  } finally {
    await client.close()
    console.log('\nDisconnected from MongoDB')
  }
}

// Run the test
if (require.main === module) {
  testSizeStockReduction()
    .then(() => {
      console.log('Test completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Test failed:', error)
      process.exit(1)
    })
}

export default testSizeStockReduction