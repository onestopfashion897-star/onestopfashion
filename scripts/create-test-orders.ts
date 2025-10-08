import { MongoClient, ObjectId } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/stylehub'
const DB_NAME = 'stylehub'

async function createTestOrders() {
  const client = new MongoClient(MONGODB_URI)
  
  try {
    await client.connect()
    console.log('Connected to MongoDB')
    
    const db = client.db(DB_NAME)
    
    // Get the test user
    const user = await db.collection('users').findOne({ email: 'john@example.com' })
    if (!user) {
      console.error('Test user not found. Please run seed-data.ts first.')
      return
    }
    
    // Get some products
    const products = await db.collection('products').find({}).limit(3).toArray()
    if (products.length === 0) {
      console.error('No products found. Please run seed-data.ts first.')
      return
    }
    
    // Create test orders
    const orders = [
      {
        orderId: `ORD-${Date.now()}-001`,
        userId: user._id,
        items: [
          {
            productId: products[0]._id.toString(),
            name: products[0].name,
            price: products[0].offerPrice || products[0].price,
            quantity: 1,
            size: products[0].sizes[0],
            image: products[0].images[0]
          }
        ],
        shippingAddress: {
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.addresses[0].address,
          city: user.addresses[0].city,
          state: user.addresses[0].state,
          pincode: user.addresses[0].pincode
        },
        paymentMethod: 'razorpay',
        paymentStatus: 'paid',
        orderStatus: 'delivered',
        subtotal: products[0].offerPrice || products[0].price,
        shippingCost: 0,
        discount: 0,
        total: products[0].offerPrice || products[0].price,
        razorpayPaymentId: 'pay_test_123456789',
        razorpayOrderId: 'order_test_123456789',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      },
      {
        orderId: `ORD-${Date.now()}-002`,
        userId: user._id,
        items: [
          {
            productId: products[1]._id.toString(),
            name: products[1].name,
            price: products[1].offerPrice || products[1].price,
            quantity: 2,
            size: products[1].sizes[1],
            image: products[1].images[0]
          }
        ],
        shippingAddress: {
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.addresses[0].address,
          city: user.addresses[0].city,
          state: user.addresses[0].state,
          pincode: user.addresses[0].pincode
        },
        paymentMethod: 'razorpay',
        paymentStatus: 'paid',
        orderStatus: 'shipped',
        subtotal: (products[1].offerPrice || products[1].price) * 2,
        shippingCost: 99,
        discount: 200,
        total: (products[1].offerPrice || products[1].price) * 2 + 99 - 200,
        razorpayPaymentId: 'pay_test_987654321',
        razorpayOrderId: 'order_test_987654321',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        orderId: `ORD-${Date.now()}-003`,
        userId: user._id,
        items: [
          {
            productId: products[2]._id.toString(),
            name: products[2].name,
            price: products[2].offerPrice || products[2].price,
            quantity: 1,
            size: products[2].sizes[2],
            image: products[2].images[0]
          },
          {
            productId: products[0]._id.toString(),
            name: products[0].name,
            price: products[0].offerPrice || products[0].price,
            quantity: 1,
            size: products[0].sizes[1],
            image: products[0].images[0]
          }
        ],
        shippingAddress: {
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.addresses[0].address,
          city: user.addresses[0].city,
          state: user.addresses[0].state,
          pincode: user.addresses[0].pincode
        },
        paymentMethod: 'cod',
        paymentStatus: 'pending',
        orderStatus: 'processing',
        subtotal: (products[2].offerPrice || products[2].price) + (products[0].offerPrice || products[0].price),
        shippingCost: 99,
        discount: 0,
        total: (products[2].offerPrice || products[2].price) + (products[0].offerPrice || products[0].price) + 99,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      }
    ]
    
    await db.collection('orders').insertMany(orders)
    console.log('✅ Created test orders successfully!')
    console.log(`Created ${orders.length} orders for user: ${user.email}`)
    
  } catch (error) {
    console.error('Error creating test orders:', error)
  } finally {
    await client.close()
  }
}

// Run the function
createTestOrders()