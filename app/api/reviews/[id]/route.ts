import { NextRequest, NextResponse } from 'next/server'
import { ReviewService } from '@/lib/models'
import { AuthService } from '@/lib/auth'
import { ObjectId } from 'mongodb'

// PUT /api/reviews/[id] - Update user's own review
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const tokenData = AuthService.validateToken(token)
    if (!tokenData) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const reviewId = params.id
    const body = await request.json()
    const { rating, comment } = body

    // Validate required fields
    if (!rating || !comment) {
      return NextResponse.json(
        { error: 'Rating and comment are required' },
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

    // Get the existing review to verify ownership
    const existingReview = await ReviewService.getReviewById(reviewId)
    if (!existingReview) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    // Check if the user owns this review
    if (existingReview.userId.toString() !== tokenData.userId) {
      return NextResponse.json(
        { error: 'You can only edit your own reviews' },
        { status: 403 }
      )
    }

    // Update the review
    const updateData = {
      rating,
      comment: comment.trim()
    }

    const success = await ReviewService.updateReview(reviewId, updateData)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update review' },
        { status: 500 }
      )
    }

    // Get the updated review
    const updatedReview = await ReviewService.getReviewById(reviewId)

    return NextResponse.json({
      success: true,
      data: updatedReview,
      message: 'Review updated successfully'
    })
  } catch (error) {
    console.error('Error updating review:', error)
    return NextResponse.json(
      { error: 'Failed to update review' },
      { status: 500 }
    )
  }
}