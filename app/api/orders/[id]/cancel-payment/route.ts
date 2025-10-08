import { NextRequest, NextResponse } from 'next/server'
import { OrderService, ProductService } from '@/lib/models'
import { AuthService } from '@/lib/auth'
import { ObjectId } from 'mongodb'

// Helper function to restore product stock by size
async function restoreProductStock(productId: string, size: string, quantity: number) {
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
            stock: sizeStock.stock + quantity
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
      // If no sizeStocks, just increase the general stock
      const newStock = product.stock + quantity
      await ProductService.updateProduct(productId, { stock: newStock })
    }
  } catch (error) {
    console.error(`Error restoring stock for product ${productId}, size ${size}:`, error)
    throw error
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id: orderId } = params
    const body = await request.json()
    const { reason = 'Payment failed' } = body

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

    // Find the order
    const order = await OrderService.findById(orderId)
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      )
    }

    // Verify order belongs to user
    if (order.userId.toString() !== decoded.userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Only cancel orders that are pending payment
    if (order.paymentStatus !== 'pending') {
      return NextResponse.json(
        { success: false, error: 'Order cannot be cancelled' },
        { status: 400 }
      )
    }

    // Restore product stock for each item in the order
    try {
      for (const item of order.items) {
        if (item.productId && item.size && item.quantity) {
          await restoreProductStock(item.productId.toString(), item.size, item.quantity)
        }
      }
    } catch (stockError) {
      console.error('Error restoring product stock:', stockError)
      // Continue with cancellation even if stock restoration fails
    }

    // Update order status to cancelled
    const { DatabaseService } = await import('@/lib/models')
    const updateResult = await DatabaseService.update('orders', orderId, {
      orderStatus: 'cancelled',
      paymentStatus: 'failed',
      cancelReason: reason,
      cancelledAt: new Date()
    })

    if (!updateResult) {
      return NextResponse.json(
        { success: false, error: 'Failed to update order' },
        { status: 500 }
      )
    }

    // Get updated order
    const updatedOrder = await OrderService.findById(orderId)

    return NextResponse.json({
      success: true,
      data: {
        order: updatedOrder,
        message: 'Order cancelled successfully'
      }
    })

  } catch (error) {
    console.error('Error cancelling order:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to cancel order' },
      { status: 500 }
    )
  }
}