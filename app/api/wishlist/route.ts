import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth'
import { WishlistService } from '@/lib/models'

// GET /api/wishlist - Get user's wishlist (Protected)
export const GET = withAuth(async (request: NextRequest) => {
  try {
    const userId = (request as any).user.userId
    
    const wishlistItems = await WishlistService.getUserWishlist(userId)
    
    return NextResponse.json({
      success: true,
      data: wishlistItems,
    })
  } catch (error) {
    console.error('Error fetching wishlist:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch wishlist' },
      { status: 500 }
    )
  }
})

// POST /api/wishlist - Add item to wishlist (Protected)
export const POST = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { productId } = body
    const userId = (request as any).user.userId

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // Check if already in wishlist
    const isInWishlist = await WishlistService.isInWishlist(userId, productId)
    if (isInWishlist) {
      return NextResponse.json(
        { success: false, error: 'Product already in wishlist' },
        { status: 409 }
      )
    }

    // Add to wishlist
    await WishlistService.addToWishlist(userId, productId)

    return NextResponse.json({
      success: true,
      message: 'Product added to wishlist successfully',
    })
  } catch (error) {
    console.error('Error adding to wishlist:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to add to wishlist' },
      { status: 500 }
    )
  }
})

// DELETE /api/wishlist - Remove item from wishlist (Protected)
export const DELETE = withAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const userId = (request as any).user.userId

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // Remove from wishlist
    const success = await WishlistService.removeFromWishlist(userId, productId)
    
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Product not found in wishlist' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Product removed from wishlist successfully',
    })
  } catch (error) {
    console.error('Error removing from wishlist:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to remove from wishlist' },
      { status: 500 }
    )
  }
}) 