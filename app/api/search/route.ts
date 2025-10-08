import { NextRequest, NextResponse } from 'next/server'
import { ProductService } from '@/lib/models'
import { PaginationParams } from '@/lib/types'

// GET /api/search - Search products by name, description, tags, brand
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const sortBy = searchParams.get('sortBy') || 'name'
    const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'asc'

    if (!q || q.trim().length < 2) {
      return NextResponse.json({
        success: false,
        error: 'Search query must be at least 2 characters long'
      }, { status: 400 })
    }

    const pagination: PaginationParams = { page, limit, sortBy, sortOrder }
    
    // Search products using the existing search method
    const products = await ProductService.searchProducts(q.trim(), pagination)

    return NextResponse.json({
      success: true,
      data: products,
      query: q,
      pagination: {
        page,
        limit,
        total: products.length
      }
    })
  } catch (error) {
    console.error('Error searching products:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to search products' },
      { status: 500 }
    )
  }
}