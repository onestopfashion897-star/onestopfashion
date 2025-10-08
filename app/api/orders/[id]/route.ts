import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { OrderService, DatabaseService } from '@/lib/models'
import { withAdminAuth, withAuth, AuthService } from '@/lib/auth'

export const GET = withAuth(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 })
    }

    const order = await OrderService.findByIdWithProductDetails(id)
    
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 })
    }

    // Read authenticated user from request (set by withAuth)
    const authReq = request as any
    const user = authReq.user as { userId: string; email: string; role: string } | undefined

    const isAdmin = user ? AuthService.hasAdminRole(user.role) : false
    const orderUserId = (order as any).userId
    const orderUserIdStr = typeof orderUserId === 'string' ? orderUserId : orderUserId?.toString?.() ?? ''

    if (process.env.NODE_ENV !== 'production') {
      console.debug('[orders/[id] GET] userId check', {
        orderId: id,
        orderUserId: orderUserIdStr,
        authUserId: user?.userId,
        role: user?.role,
        isAdmin
      })
    }

    // Check if user owns this order or is an admin
    if (!user || (!isAdmin && orderUserIdStr !== user.userId)) {
      // Fallback: verify ownership directly in DB in case of unexpected type issues
      if (user) {
        try {
          const owns = await DatabaseService.findOne('orders', { _id: new ObjectId(id), userId: new ObjectId(user.userId) })
          if (owns) {
            // User owns the order; allow access
            return NextResponse.json({ success: true, data: order })
          }
        } catch (e) {
          // ignore fallback errors, proceed to deny
        }
      }
      return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 })
    }

    return NextResponse.json({
      success: true,
      data: order
    })
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch order' 
    }, { status: 500 })
  }
})

export const PATCH = withAdminAuth(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const body = await request.json()
    const { orderStatus, paymentStatus } = body

    const updateData: any = { updatedAt: new Date() }
    if (orderStatus) updateData.orderStatus = orderStatus
    if (paymentStatus) updateData.paymentStatus = paymentStatus

    const result = await DatabaseService.update('orders', params.id, updateData)

    if (!result) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: { message: 'Order updated successfully' }
    })
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json({ success: false, error: 'Failed to update order status' }, { status: 500 })
  }
})