import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/models'
import { withAdminAuth } from '@/lib/auth'

// GET /api/coupons - Get all coupons (Admin only)
export const GET = withAdminAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''

    let coupons
    if (search) {
      const searchRegex = { $regex: search, $options: 'i' }
      coupons = await DatabaseService.find('coupons', {
        $or: [
          { code: searchRegex },
          { description: searchRegex }
        ]
      }, { page, limit })
    } else {
      coupons = await DatabaseService.find('coupons', {}, { page, limit })
    }

    return NextResponse.json({
      success: true,
      data: coupons,
    })
  } catch (error) {
    console.error('Error fetching coupons:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch coupons' },
      { status: 500 }
    )
  }
})

// POST /api/coupons - Create new coupon (Admin only)
export const POST = withAdminAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { 
      code, 
      type, 
      value, 
      minAmount, 
      maxDiscount, 
      usageLimit, 
      validFrom, 
      validUntil, 
      isActive 
    } = body

    if (!code || !type || !value) {
      return NextResponse.json(
        { success: false, error: 'Code, type, and value are required' },
        { status: 400 }
      )
    }

    // Check if coupon with same code already exists
    const existingCoupon = await DatabaseService.findOne('coupons', { 
      code: code.toUpperCase() 
    })

    if (existingCoupon) {
      return NextResponse.json(
        { success: false, error: 'Coupon with this code already exists' },
        { status: 409 }
      )
    }

    const couponData = {
      code: code.toUpperCase().trim(),
      type,
      value: parseFloat(value),
      minAmount: minAmount ? parseFloat(minAmount) : 0,
      maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
      usageLimit: usageLimit ? parseInt(usageLimit) : null,
      usedCount: 0,
      validFrom: validFrom ? new Date(validFrom) : new Date(),
      validUntil: validUntil ? new Date(validUntil) : null,
      isActive: isActive !== undefined ? isActive : true
    }

    const coupon = await DatabaseService.create('coupons', couponData)

    return NextResponse.json({
      success: true,
      data: coupon,
      message: 'Coupon created successfully',
    })
  } catch (error) {
    console.error('Error creating coupon:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create coupon' },
      { status: 500 }
    )
  }
})