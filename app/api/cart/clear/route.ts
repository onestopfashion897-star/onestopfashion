import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth'
import { CartService } from '@/lib/models'

// Extend NextRequest to include user property
interface AuthenticatedRequest extends NextRequest {
  user: {
    userId: string
    email: string
    role: string
  }
}

// POST /api/cart/clear - Clear entire cart (Protected)
export const POST = withAuth(async (request: NextRequest) => {
  try {
    const req = request as AuthenticatedRequest
    const userId = req.user.userId

    const cart = await CartService.clearCart(userId)
    
    return NextResponse.json({
      success: true,
      message: 'Cart cleared successfully',
      data: {
        total: cart.total,
        itemCount: cart.itemCount
      }
    })
  } catch (error) {
    console.error('Error clearing cart:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to clear cart' },
      { status: 500 }
    )
  }
})