import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/models'

interface TrackingInfo {
  orderId: string
  status: string
  estimatedDelivery: string
  currentLocation?: string
  trackingNumber?: string
  timeline: {
    status: string
    description: string
    timestamp: string
    completed: boolean
  }[]
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')

    if (!orderId) {
      return NextResponse.json({
        success: false,
        error: 'Order ID is required'
      }, { status: 400 })
    }

    // Fetch order from database
    const order = await DatabaseService.findOne('orders', { orderId })

    if (!order) {
      return NextResponse.json({
        success: false,
        error: 'Order not found'
      }, { status: 404 })
    }

    // Generate tracking information based on order status and creation date
    const trackingInfo: TrackingInfo = generateTrackingInfo(order)

    return NextResponse.json({
      success: true,
      data: trackingInfo
    })

  } catch (error) {
    console.error('Error tracking order:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

function generateTrackingInfo(order: any): TrackingInfo {
  const orderDate = new Date(order.createdAt)
  const currentDate = new Date()
  const daysSinceOrder = Math.floor((currentDate.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24))

  // Generate estimated delivery date (5-7 days from order date)
  const estimatedDelivery = new Date(orderDate)
  estimatedDelivery.setDate(orderDate.getDate() + 6)

  // Determine current status based on order age and payment status
  let currentStatus = 'pending'
  let currentLocation = ''
  
  if (order.paymentStatus === 'paid') {
    if (daysSinceOrder >= 5) {
      currentStatus = 'delivered'
      currentLocation = 'Delivered to your address'
    } else if (daysSinceOrder >= 3) {
      currentStatus = 'out for delivery'
      currentLocation = 'Local delivery hub'
    } else if (daysSinceOrder >= 1) {
      currentStatus = 'shipped'
      currentLocation = 'In transit'
    } else {
      currentStatus = 'processing'
      currentLocation = 'Fulfillment center'
    }
  } else if (order.paymentStatus === 'failed') {
    currentStatus = 'cancelled'
  }

  // Generate timeline based on current status
  const timeline = generateTimeline(orderDate, currentStatus, daysSinceOrder)

  // Generate tracking number
  const trackingNumber = `HF${order.orderId.slice(-8).toUpperCase()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`

  return {
    orderId: order.orderId,
    status: currentStatus,
    estimatedDelivery: estimatedDelivery.toISOString(),
    currentLocation: currentLocation || undefined,
    trackingNumber: order.paymentStatus === 'paid' ? trackingNumber : undefined,
    timeline
  }
}

function generateTimeline(orderDate: Date, currentStatus: string, daysSinceOrder: number) {
  const timeline = []
  
  // Order placed
  timeline.push({
    status: 'Order Placed',
    description: 'Your order has been received and is being processed',
    timestamp: orderDate.toISOString(),
    completed: true
  })

  // Payment confirmed (if paid)
  if (currentStatus !== 'cancelled') {
    const paymentDate = new Date(orderDate)
    paymentDate.setMinutes(paymentDate.getMinutes() + 5)
    timeline.push({
      status: 'Payment Confirmed',
      description: 'Payment has been successfully processed',
      timestamp: paymentDate.toISOString(),
      completed: true
    })
  }

  // Processing
  if (daysSinceOrder >= 0 && currentStatus !== 'cancelled') {
    const processingDate = new Date(orderDate)
    processingDate.setHours(processingDate.getHours() + 2)
    timeline.push({
      status: 'Processing',
      description: 'Your order is being prepared for shipment',
      timestamp: processingDate.toISOString(),
      completed: daysSinceOrder >= 1
    })
  }

  // Shipped
  if (daysSinceOrder >= 1 && currentStatus !== 'cancelled') {
    const shippedDate = new Date(orderDate)
    shippedDate.setDate(shippedDate.getDate() + 1)
    timeline.push({
      status: 'Shipped',
      description: 'Your order has been dispatched and is on its way',
      timestamp: shippedDate.toISOString(),
      completed: daysSinceOrder >= 1
    })
  }

  // Out for delivery
  if (daysSinceOrder >= 3 && currentStatus !== 'cancelled') {
    const outForDeliveryDate = new Date(orderDate)
    outForDeliveryDate.setDate(outForDeliveryDate.getDate() + 3)
    timeline.push({
      status: 'Out for Delivery',
      description: 'Your order is out for delivery and will arrive soon',
      timestamp: outForDeliveryDate.toISOString(),
      completed: daysSinceOrder >= 3
    })
  }

  // Delivered
  if (daysSinceOrder >= 5 && currentStatus !== 'cancelled') {
    const deliveredDate = new Date(orderDate)
    deliveredDate.setDate(deliveredDate.getDate() + 5)
    timeline.push({
      status: 'Delivered',
      description: 'Your order has been successfully delivered',
      timestamp: deliveredDate.toISOString(),
      completed: daysSinceOrder >= 5
    })
  }

  // Cancelled (if payment failed)
  if (currentStatus === 'cancelled') {
    const cancelledDate = new Date(orderDate)
    cancelledDate.setHours(cancelledDate.getHours() + 1)
    timeline.push({
      status: 'Cancelled',
      description: 'Order was cancelled due to payment failure',
      timestamp: cancelledDate.toISOString(),
      completed: true
    })
  }

  return timeline
}