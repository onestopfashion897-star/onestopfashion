import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/auth'
import { ReviewService, ProductService } from '@/lib/models'
import { ObjectId } from 'mongodb'

// POST /api/admin/reviews - Create a fake/admin review for a product
export const POST = withAdminAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { productId, rating, comment, reviewerName, reviewerAvatar, status } = body

    // Validate required fields
    if (!productId || !rating || !comment) {
      return NextResponse.json(
        { success: false, error: 'Product ID, rating, and comment are required' },
        { status: 400 }
      )
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Ensure product exists
    const product = await ProductService.findById(productId)
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    // Build review data. Use synthetic IDs for user/order since this is an admin-created fake review.
    const reviewData = {
      productId: new ObjectId(productId),
      userId: new ObjectId(),
      orderId: new ObjectId(),
      rating,
      comment: String(comment).trim(),
      status: (status as 'pending' | 'approved' | 'rejected') || 'approved',
      helpful: 0,
      reported: false,
      reviewerName: reviewerName || 'Happy Feet Customer',
      reviewerAvatar: reviewerAvatar || '',
      verifiedPurchase: false,
    }

    const review = await ReviewService.createReview(reviewData)

    return NextResponse.json({
      success: true,
      data: review,
      message: 'Fake review created successfully',
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating admin review:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create review' },
      { status: 500 }
    )
  }
})