import { NextRequest, NextResponse } from 'next/server'
import { OrderService } from '@/lib/models'
import { withAdminAuth } from '@/lib/auth'

export const PATCH = withAdminAuth(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const { notes } = await request.json()
    
    if (typeof notes !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Valid notes string is required' },
        { status: 400 }
      )
    }

    const updateSuccess = await OrderService.updateOrderNotes(params.id, notes)
    
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
    console.error('Error updating order notes:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
})