import { NextRequest, NextResponse } from 'next/server'
import { CouponService } from '@/lib/models'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, subtotal } = body

    if (!code || !subtotal) {
      return NextResponse.json(
        { success: false, error: 'Coupon code and subtotal are required' },
        { status: 400 }
      )
    }

    const couponValidation = await CouponService.validateCoupon(code, subtotal)

    if (couponValidation.valid && couponValidation.coupon) {
      const coupon = couponValidation.coupon
      let discount = 0

      if (coupon.type === 'percentage') {
        discount = Math.min((subtotal * coupon.value) / 100, coupon.maxDiscount || Infinity)
      } else if (coupon.type === 'fixed') {
        discount = coupon.value
      } else if (coupon.type === 'shipping') {
        discount = subtotal >= 999 ? 0 : 99 // Free shipping threshold
      }

      return NextResponse.json({
        success: true,
        data: {
          code: coupon.code,
          discount: Math.round(discount),
          type: coupon.type,
          description: coupon.description
        }
      })
    } else {
      return NextResponse.json(
        { success: false, error: couponValidation.error || 'Invalid coupon code' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Coupon validation error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to validate coupon' },
      { status: 500 }
    )
  }
}