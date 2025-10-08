import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth'
import { CartItem } from '@/lib/types'
import { CartService } from '@/lib/models'

// Extend NextRequest to include user property
interface AuthenticatedRequest extends NextRequest {
  user: { userId: string; email: string; role: string }
}

// GET /api/cart - Get user's cart (Protected)
export const GET = withAuth(async (request: NextRequest) => {
  try {
    const req = request as AuthenticatedRequest
    const userId = req.user.userId
    const cart = await CartService.getUserCart(userId)
    
    return NextResponse.json({
      success: true,
      data: {
        items: cart.items.map((item: any) => ({
          productId: item.productId.toString(),
          name: item.name,
          price: item.price,
          offerPrice: item.offerPrice,
          quantity: item.quantity,
          size: item.size,
          image: item.image,
          stock: item.stock,
          variantId: item.variantId,
          variantName: item.variantName,
          variantType: item.variantType
        })),
        total: cart.total,
        itemCount: cart.itemCount,
      },
    })
  } catch (error) {
    console.error('Error fetching cart:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cart' },
      { status: 500 }
    )
  }
})

// POST /api/cart - Add item to cart (Protected)
export const POST = withAuth(async (request: NextRequest) => {
  try {
    const req = request as AuthenticatedRequest
    const userId = req.user.userId
    const body: CartItem = await request.json()
    const { productId, name, price, offerPrice, quantity, size, image, stock, variantId, variantName, variantType } = body

    // Validate required fields
    if (!productId || !name || !price || !quantity || !size || !image) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate quantity
    if (quantity <= 0 || quantity > stock) {
      return NextResponse.json(
        { success: false, error: 'Invalid quantity' },
        { status: 400 }
      )
    }

    const cart = await CartService.addItem(userId, body)
    
    return NextResponse.json({
      success: true,
      message: 'Item added to cart successfully',
      data: {
        total: cart.total,
        itemCount: cart.itemCount
      }
    })
  } catch (error) {
    console.error('Error adding item to cart:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to add item to cart' },
      { status: 500 }
    )
  }
})

// PUT /api/cart - Update cart item (Protected)
export const PUT = withAuth(async (request: NextRequest) => {
  try {
    const req = request as AuthenticatedRequest
    const userId = req.user.userId
    const body: { productId: string; size: string; quantity: number; variantId?: string } = await request.json()
    const { productId, size, quantity, variantId } = body

    // Validate input
    if (!productId || !size || quantity === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (quantity < 0) {
      return NextResponse.json(
        { success: false, error: 'Quantity cannot be negative' },
        { status: 400 }
      )
    }

    const cart = await CartService.updateItemQuantity(userId, productId, size, quantity, variantId)
    
    return NextResponse.json({
      success: true,
      message: 'Cart updated successfully',
      data: {
        total: cart.total,
        itemCount: cart.itemCount
      }
    })
  } catch (error) {
    console.error('Error updating cart:', error)
    
    if (error instanceof Error && error.message === 'Item not found in cart') {
      return NextResponse.json(
        { success: false, error: 'Item not found in cart' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to update cart' },
      { status: 500 }
    )
  }
})

// DELETE /api/cart - Remove item from cart (Protected)
export const DELETE = withAuth(async (request: NextRequest) => {
  try {
    const req = request as AuthenticatedRequest
    const userId = req.user.userId
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const size = searchParams.get('size')
    const variantId = searchParams.get('variantId')

    if (!productId || !size) {
      return NextResponse.json(
        { success: false, error: 'Product ID and size are required' },
        { status: 400 }
      )
    }

    const cart = await CartService.removeItem(userId, productId, size, variantId || undefined)
    
    return NextResponse.json({
      success: true,
      message: 'Item removed from cart successfully',
      data: {
        total: cart.total,
        itemCount: cart.itemCount
      }
    })
  } catch (error) {
    console.error('Error removing item from cart:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to remove item from cart' },
      { status: 500 }
    )
  }
})