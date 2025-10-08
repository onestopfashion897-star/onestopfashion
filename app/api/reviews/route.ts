import { NextRequest, NextResponse } from 'next/server'
import { ReviewService, UserService, ProductService } from '@/lib/models'
import { AuthService } from '@/lib/auth'
import { Review } from '@/lib/types'
import { ObjectId } from 'mongodb'

// GET /api/reviews - Get reviews with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    let reviews: Review[] = []

    if (productId) {
      // Get reviews for a specific product
      const approvedOnly = status !== 'all'
      reviews = await ReviewService.getProductReviews(productId, approvedOnly)
    } else if (userId) {
      // Get reviews by a specific user
      reviews = await ReviewService.getUserReviews(userId)
    } else {
      // Get all reviews (admin only)
      // Use cookie-aware extraction to support adminToken cookie or Authorization header
      const token = AuthService.extractToken(request)
      if (!token) {
        return NextResponse.json({ error: 'Admin access required' }, { status: 401 })
      }

      const tokenData = AuthService.validateToken(token)
      if (!tokenData || !AuthService.hasAdminRole(tokenData.role)) {
        return NextResponse.json({ error: 'Invalid admin token' }, { status: 401 })
      }

      reviews = await ReviewService.getAllReviews({
        page,
        limit,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      })
    }

    return NextResponse.json({
      success: true,
      data: reviews
    })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}

// POST /api/reviews - Create a new review (requires purchase verification)
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const tokenData = AuthService.validateToken(token)
    if (!tokenData) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const { productId, rating, comment, orderId } = body

    // Validate required fields
    if (!productId || !rating || !comment) {
      return NextResponse.json(
        { error: 'Product ID, rating, and comment are required' },
        { status: 400 }
      )
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Check if user has already reviewed this product (one review per user per product)
    const existingUserReview = await ReviewService.getUserProductReview(
      tokenData.userId,
      productId
    )
    
    if (existingUserReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this product. You can edit your existing review instead.' },
        { status: 409 }
      )
    }

    // Verify purchase if orderId is not provided
    let verifiedOrderId = orderId as string | undefined
    if (!verifiedOrderId) {
      const purchaseVerification = await ReviewService.verifyPurchaseForReview(
        tokenData.userId,
        productId
      )
      
      if (!purchaseVerification.canReview) {
        return NextResponse.json(
          { error: 'You can only review products you have purchased and received' },
          { status: 403 }
        )
      }
      
      verifiedOrderId = purchaseVerification.orderId!
    }

    // Get user details for caching
    const userData = await UserService.findById(tokenData.userId)
    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Create the review (ensure ObjectId types are used)
    const reviewData = {
      productId: new ObjectId(productId),
      userId: new ObjectId(tokenData.userId),
      orderId: new ObjectId(verifiedOrderId!),
      rating,
      comment: comment.trim(),
      status: 'approved' as const,
      helpful: 0,
      reported: false,
      reviewerName: userData.name,
      reviewerAvatar: userData.avatar,
      verifiedPurchase: true
    }

    const review = await ReviewService.createReview(reviewData)

    return NextResponse.json({
      success: true,
      data: review,
      message: 'Review submitted successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    )
  }
}

// PUT /api/reviews - Update review status (admin only)
export async function PUT(request: NextRequest) {
  try {
    // Use cookie-aware extraction to support adminToken cookie or Authorization header
    const token = AuthService.extractToken(request)
    if (!token) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 401 })
    }

    const tokenData = AuthService.validateToken(token)
    if (!tokenData || !AuthService.hasAdminRole(tokenData.role)) {
      return NextResponse.json({ error: 'Invalid admin token' }, { status: 401 })
    }

    const body = await request.json()
    const { reviewId, status, adminResponse } = body

    if (!reviewId || !status) {
      return NextResponse.json(
        { error: 'Review ID and status are required' },
        { status: 400 }
      )
    }

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be pending, approved, or rejected' },
        { status: 400 }
      )
    }

    const success = await ReviewService.updateReviewStatus(reviewId, status, adminResponse)
    
    if (!success) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: `Review ${status} successfully`
    })
  } catch (error) {
    console.error('Error updating review:', error)
    return NextResponse.json(
      { error: 'Failed to update review' },
      { status: 500 }
    )
  }
}

// DELETE /api/reviews - Delete review (admin only)
export async function DELETE(request: NextRequest) {
  try {
    // Use cookie-aware extraction to support adminToken cookie or Authorization header
    const token = AuthService.extractToken(request)
    if (!token) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 401 })
    }

    const tokenData = AuthService.validateToken(token)
    if (!tokenData || !AuthService.hasAdminRole(tokenData.role)) {
      return NextResponse.json({ error: 'Invalid admin token' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    let reviewId = searchParams.get('id')

    // Also support DELETE body payload { reviewId }
    if (!reviewId) {
      try {
        const body = await request.json()
        reviewId = body?.reviewId || body?.id || null
      } catch {
        // ignore body parse errors for DELETE
      }
    }

    if (!reviewId) {
      return NextResponse.json(
        { error: 'Review ID is required' },
        { status: 400 }
      )
    }

    const success = await ReviewService.deleteReview(reviewId)
    
    if (!success) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting review:', error)
    return NextResponse.json(
      { error: 'Failed to delete review' },
      { status: 500 }
    )
  }
}