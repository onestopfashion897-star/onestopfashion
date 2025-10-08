import { NextRequest, NextResponse } from 'next/server'
import { OrderService } from '@/lib/models'
import { withAdminAuth } from '@/lib/auth'

export const PATCH = withAdminAuth(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const { trackingNumber } = await request.json()
    
    if (!trackingNumber || typeof trackingNumber !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Valid tracking number is required' },
        { status: 400 }
      )
    }

    const updateSuccess = await OrderService.updateTrackingNumber(params.id, trackingNumber)
    
    if (!updateSuccess) {
      return NextResponse.json(
        { success: false, error: 'Order not found or failed to update' },
        { status: 404 }
      )
    }

    // Get the updated order
    const updatedOrder = await OrderService.getOrderById(params.id)

    return NextResponse.json({
      success: true,
      order: updatedOrder
    })
  } catch (error) {
    console.error('Error updating tracking number:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
})