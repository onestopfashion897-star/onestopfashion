import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/auth'
import { DatabaseService } from '@/lib/models'

// GET /api/coupons/[id] - Get coupon by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const coupon = await DatabaseService.findById('coupons', params.id)

    if (!coupon) {
      return NextResponse.json(
        { success: false, error: 'Coupon not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: coupon,
    })
  } catch (error) {
    console.error('Error fetching coupon:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch coupon' },
      { status: 500 }
    )
  }
}

// PUT /api/coupons/[id] - Update coupon (Admin only)
export const PUT = withAdminAuth(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const body = await request.json()
    const { 
      code, 
      type, 
      value, 
      maxDiscount, 
      minAmount, 
      maxAmount, 
      usageLimit, 
      validFrom, 
      validUntil, 
      description, 
      isActive 
    } = body

    const existingCoupon = await DatabaseService.findById('coupons', params.id)
    if (!existingCoupon) {
      return NextResponse.json(
        { success: false, error: 'Coupon not found' },
        { status: 404 }
      )
    }

    if (!code || !type || !value || !minAmount || !usageLimit || !validFrom || !validUntil) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if coupon code already exists (excluding current coupon)
    const existingCouponWithCode = await DatabaseService.findOne('coupons', {
      $and: [
        { code: code.toUpperCase() },
        { _id: { $ne: params.id } }
      ]
    })

    if (existingCouponWithCode) {
      return NextResponse.json(
        { success: false, error: 'Coupon code already exists' },
        { status: 409 }
      )
    }

    const updateData = {
      code: code.toUpperCase(),
      type,
      value: parseFloat(value),
      maxDiscount: maxDiscount ? parseFloat(maxDiscount) : undefined,
      minAmount: parseFloat(minAmount),
      maxAmount: maxAmount ? parseFloat(maxAmount) : undefined,
      usageLimit: parseInt(usageLimit),
      validFrom: new Date(validFrom),
      validUntil: new Date(validUntil),
      description: description || '',
      isActive: isActive !== undefined ? isActive : true,
      updatedAt: new Date()
    }

    const success = await DatabaseService.update('coupons', params.id, updateData)

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to update coupon' },
        { status: 500 }
      )
    }

    const updatedCoupon = await DatabaseService.findById('coupons', params.id)

    return NextResponse.json({
      success: true,
      data: updatedCoupon,
      message: 'Coupon updated successfully',
    })
  } catch (error) {
    console.error('Error updating coupon:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update coupon' },
      { status: 500 }
    )
  }
})

// DELETE /api/coupons/[id] - Delete coupon (Admin only)
export const DELETE = withAdminAuth(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const existingCoupon = await DatabaseService.findById('coupons', params.id)
    if (!existingCoupon) {
      return NextResponse.json(
        { success: false, error: 'Coupon not found' },
        { status: 404 }
      )
    }

    const success = await DatabaseService.delete('coupons', params.id)

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete coupon' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Coupon deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting coupon:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete coupon' },
      { status: 500 }
    )
  }
}) 