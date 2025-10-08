import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'
import { DatabaseService } from '@/lib/models'

interface Order {
  _id: string
  orderId: string
  userId: string
  items: any[]
  shippingAddress: any
  paymentMethod: string
  paymentStatus: string
  razorpayPaymentId?: string
  total: number
  createdAt: string
}

interface User {
  _id: string
  email: string
  name?: string
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = AuthService.validateToken(token)
    if (!decoded) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 })
    }

    const { id } = params
    if (!id) {
      return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 })
    }

    // Fetch order details
    const order = await DatabaseService.findById('orders', id) as Order
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 })
    }

    // Verify order belongs to user
    if (order.userId.toString() !== decoded.userId) {
      return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 })
    }

    // Get user details
    const user = await DatabaseService.findById('users', decoded.userId) as User
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    // Send confirmation email
    const emailSent = await sendOrderConfirmationEmail(order, user)

    // Update order to mark confirmation email as sent
    await DatabaseService.update(
      'orders',
      order._id,
      { 
        confirmationEmailSent: true,
        confirmationEmailSentAt: new Date()
      }
    )

    return NextResponse.json({
      success: true,
      message: 'Order confirmation email sent successfully'
    })

  } catch (error) {
    console.error('Error sending confirmation email:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send confirmation email' },
      { status: 500 }
    )
  }
}

// Import email service
import { emailService, OrderConfirmationData } from '@/lib/email'

// Function to send order confirmation email
async function sendOrderConfirmationEmail(order: Order, user: User): Promise<boolean> {
  try {
    const emailData: OrderConfirmationData = {
      orderId: order.orderId,
      customerName: user.name || 'Customer',
      customerEmail: user.email,
      items: order.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        size: item.size
      })),
      totalAmount: order.total,
      shippingAddress: order.shippingAddress,
      paymentMethod: order.paymentMethod,
      paymentId: order.razorpayPaymentId,
      estimatedDelivery: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString() // 6 days from now
    }

    return await emailService.sendOrderConfirmation(emailData)
  } catch (error) {
    console.error('Error sending order confirmation email:', error)
    return false
  }
}