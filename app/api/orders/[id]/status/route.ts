import { NextRequest, NextResponse } from 'next/server'
import { OrderService } from '@/lib/models'
import { withAdminAuth } from '@/lib/auth'

// PATCH /api/orders/[id]/status - Update order status (Admin only)
export const PATCH = withAdminAuth(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    console.log('PATCH /api/orders/[id]/status called with id:', params.id)
    
    // Parse request body
    let body
    try {
      body = await request.json()
    } catch (error) {
      console.error('Error parsing request body:', error)
      return NextResponse.json(
        { success: false, error: 'Invalid request body' },
        { status: 400 }
      )
    }

    const { status, trackingNumber, estimatedDelivery, notes } = body

    if (!status) {
      return NextResponse.json(
        { success: false, error: 'Status is required' },
        { status: 400 }
      )
    }

    console.log('Updating order status:', { orderId: params.id, status })

    // Check if order exists
    const existingOrder = await OrderService.getOrderById(params.id)
    if (!existingOrder) {
      console.log('Order not found:', params.id)
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: any = {
      orderStatus: status,
      updatedAt: new Date()
    }

    if (trackingNumber) {
      updateData.trackingNumber = trackingNumber
    }

    if (estimatedDelivery) {
      updateData.estimatedDelivery = estimatedDelivery
    }

    if (notes) {
      updateData.notes = notes
    }

    console.log('Update data:', updateData)

    // Update the order status
    const statusSuccess = await OrderService.updateOrderStatus(params.id, updateData.orderStatus)

    if (!statusSuccess) {
      console.error('Failed to update order status in database')
      return NextResponse.json(
        { success: false, error: 'Failed to update order status' },
        { status: 500 }
      )
    }

    // Update tracking number if provided
    if (trackingNumber) {
      const trackingSuccess = await OrderService.updateTrackingNumber(params.id, trackingNumber)
      if (!trackingSuccess) {
        console.error('Failed to update tracking number')
      }
    }

    // Update notes if provided
    if (notes) {
      const notesSuccess = await OrderService.updateOrderNotes(params.id, notes)
      if (!notesSuccess) {
        console.error('Failed to update order notes')
      }
    }

    // Update estimated delivery if provided (using direct database update)
    if (estimatedDelivery) {
      const { DatabaseService } = await import('@/lib/models')
      await DatabaseService.update('orders', params.id, {
        estimatedDelivery,
        updatedAt: new Date()
      })
    }

    // Get updated order
    const updatedOrder = await OrderService.getOrderById(params.id)

    console.log('Order status updated successfully')

    return NextResponse.json({
      success: true,
      data: updatedOrder,
      message: 'Order status updated successfully',
    })
  } catch (error) {
    console.error('Error updating order status:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update order status' },
      { status: 500 }
    )
  }
})