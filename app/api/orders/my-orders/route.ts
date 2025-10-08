import { NextRequest, NextResponse } from 'next/server'
import { OrderService } from '@/lib/models'
import { withAuth } from '@/lib/auth'

// Extend NextRequest to include user property
interface AuthenticatedRequest extends NextRequest {
  user: {
    userId: string;
    email: string;
    role: string;
  };
}

// GET /api/orders/my-orders - Get orders for current user
export const GET = withAuth(async (req: NextRequest) => {
  // Cast to AuthenticatedRequest to access user property
  const authenticatedReq = req as AuthenticatedRequest
  try {
    const userId = authenticatedReq.user.userId
    const orders = await OrderService.findUserOrdersWithProductDetails(userId)
    
    return NextResponse.json({
      success: true,
      data: orders,
    })
  } catch (error) {
    console.error('Error fetching user orders:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
})