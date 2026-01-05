import { NextRequest, NextResponse } from 'next/server'
import { ProductService } from '@/lib/models'
import { Product } from '@/lib/types'
import { withAdminAuth } from '@/lib/auth'

// GET /api/products/[id] - Get product by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await ProductService.findByIdWithRelations(params.id)
    
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: product,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=240'
      }
    })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

// PUT /api/products/[id] - Update product (Admin only)
export const PUT = withAdminAuth(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const body: Partial<Product> = await request.json()
    
    // Check if product exists
    const existingProduct = await ProductService.findById(params.id)
    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    // Update product
    const success = await ProductService.updateProduct(params.id, body)
    
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to update product' },
        { status: 500 }
      )
    }

    // Get updated product
    const updatedProduct = await ProductService.findById(params.id)

    return NextResponse.json({
      success: true,
      data: updatedProduct,
      message: 'Product updated successfully',
    })
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update product' },
      { status: 500 }
    )
  }
})

// DELETE /api/products/[id] - Delete product (Admin only)
export const DELETE = withAdminAuth(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    // Check if product exists
    const existingProduct = await ProductService.findById(params.id)
    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    // Delete product
    const success = await ProductService.deleteProduct(params.id)
    
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete product' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete product' },
      { status: 500 }
    )
  }
})