import { NextRequest, NextResponse } from 'next/server'
import { ReviewService } from '@/lib/models'
import { AuthService } from '@/lib/auth'

// GET /api/reviews/verify-purchase - Verify if user can review a product
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const tokenData = AuthService.validateToken(token)
    if (!tokenData) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    const verification = await ReviewService.verifyPurchaseForReview(
      tokenData.userId,
      productId
    )

    return NextResponse.json({
      success: true,
      ...verification
    })
  } catch (error) {
    console.error('Error verifying purchase:', error)
    return NextResponse.json(
      { error: 'Failed to verify purchase' },
      { status: 500 }
    )
  }
}