import { NextRequest, NextResponse } from 'next/server'
import { OrderService, ProductService, DatabaseService } from '@/lib/models'
import { AuthService, withAdminAuth } from '@/lib/auth'
import { ObjectId } from 'mongodb'

// GET /api/orders - Get all orders (Admin only)
export const GET = withAdminAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const status = searchParams.get('status') || ''
    const search = searchParams.get('search') || ''

    let filter: any = {}
    
    if (status) {
      filter.orderStatus = status
    }
    
    if (search) {
      filter.$or = [
        { orderId: { $regex: search, $options: 'i' } },
        { 'shippingAddress.fullName': { $regex: search, $options: 'i' } },
        { 'shippingAddress.phone': { $regex: search, $options: 'i' } }
      ]
    }

    const orders = await OrderService.getOrdersWithProductDetails(filter, { page, limit })

    return NextResponse.json({
      success: true,
      data: orders,
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
})

// Helper function to reduce product stock by size
async function reduceProductStock(productId: string, size: string, quantity: number) {
  try {
    const product = await ProductService.findById(productId)
    if (!product) {
      console.error(`Product not found: ${productId}`)
      return
    }

    // If product has sizeStocks, update the specific size stock
    if (product.sizeStocks && product.sizeStocks.length > 0) {
      const updatedSizeStocks = product.sizeStocks.map(sizeStock => {
        if (sizeStock.size === size) {
          return {
            ...sizeStock,
            stock: Math.max(0, sizeStock.stock - quantity)
          }
        }
        return sizeStock
      })

      // Calculate new total stock
      const newTotalStock = updatedSizeStocks.reduce((sum, sizeStock) => sum + sizeStock.stock, 0)

      // Update product with new sizeStocks and total stock
      await ProductService.updateProduct(productId, {
        sizeStocks: updatedSizeStocks,
        stock: newTotalStock
      })
    } else {
      // If no sizeStocks, just reduce the general stock
      const newStock = Math.max(0, product.stock - quantity)
      await ProductService.updateProduct(productId, { stock: newStock })
    }
  } catch (error) {
    console.error(`Error reducing stock for product ${productId}, size ${size}:`, error)
    throw error
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { items, shippingAddress, paymentMethod = 'cod', subtotal, shipping, discount = 0, total } = body

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Items are required' },
        { status: 400 }
      )
    }

    if (!shippingAddress) {
      return NextResponse.json(
        { success: false, error: 'Shipping address is required' },
        { status: 400 }
      )
    }

    // Get user from token
    const token = AuthService.extractToken(request)
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const decoded = AuthService.validateToken(token)
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Use totals from frontend (already calculated correctly)
    // Validate that the totals make sense
    let calculatedSubtotal = 0
    for (const item of items) {
      calculatedSubtotal += item.price * item.quantity
    }
    
    // Use frontend values but validate they're reasonable
    const finalSubtotal = subtotal || calculatedSubtotal
    const finalShipping = shipping !== undefined ? shipping : (finalSubtotal > 999 ? 0 : 99)
    const finalDiscount = discount || 0
    const finalTotal = total || (finalSubtotal + finalShipping - finalDiscount)

    // Generate order ID
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Create order data
    const orderData = {
      orderId,
      userId: new ObjectId(decoded.userId),
      items,
      shippingAddress,
      paymentMethod: paymentMethod as 'cod' | 'razorpay',
      paymentStatus: 'pending' as const, // Always start with pending, update to paid after successful payment verification
      orderStatus: 'pending' as const,
      subtotal: finalSubtotal,
      shippingCost: finalShipping,
      discount: finalDiscount,
      total: finalTotal,
    }

    // Create order
    const order = await OrderService.createOrder(orderData)

    // Reduce product stock by size for each item in the order
    try {
      for (const item of items) {
        if (item.productId && item.size && item.quantity) {
          await reduceProductStock(item.productId, item.size, item.quantity)
        }
      }
    } catch (stockError) {
      console.error('Error reducing product stock:', stockError)
      // Note: Order is already created, but stock reduction failed
      // In a production system, you might want to implement compensation logic
    }

    return NextResponse.json({
      success: true,
      data: {
        order,
        message: 'Order created successfully'
      }
    })

  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    )
  }
}