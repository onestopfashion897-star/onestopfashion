import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService, ProductService, CategoryService } from '@/lib/models'
import { Product, ProductFilters, PaginationParams } from '@/lib/types'
import { withAdminAuth } from '@/lib/auth'

// GET /api/products - Get all products with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '30'), 50)
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const brand = searchParams.get('brand') || ''
    const minPrice = searchParams.get('minPrice') || ''
    const maxPrice = searchParams.get('maxPrice') || ''
    const sortBy = searchParams.get('sortBy') || ''
    const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc'
    const featured = searchParams.get('featured') || ''
    const isFeatured = searchParams.get('isFeatured') || ''
    const deal = searchParams.get('deal') || ''
    const sizes = searchParams.get('sizes') || ''

    const pagination: PaginationParams = { page, limit, sortBy: sortBy || 'createdAt', sortOrder }

    let products: Product[] = []
    let total = 0
    const t0 = Date.now()
    
    try {
      if (search) {
        // Search products (relation lookups for brand/category retained)
        products = await ProductService.searchProducts(search, pagination)
        // For search, estimate total as returned length to avoid heavy count
        total = products.length
      } else {
        let categoryId = category
        
        const filters: ProductFilters = {
          category: categoryId,
          brand,
          minPrice: minPrice ? parseFloat(minPrice) : undefined,
          maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
          featured: (featured === 'true' || isFeatured === 'true') ? true : (featured === 'false' ? false : undefined),
          sizes: sizes ? sizes.split(',') : undefined
        }
        
        // Build a lightweight match filter for counting total
        const matchStage: any = { isActive: true }
        if (filters.featured !== undefined) matchStage.featured = filters.featured
        if (filters.inStock) matchStage.stock = { $gt: 0 }
        if (filters.minPrice || filters.maxPrice) {
          matchStage.price = {}
          if (filters.minPrice) matchStage.price.$gte = filters.minPrice
          if (filters.maxPrice) matchStage.price.$lte = filters.maxPrice
        }
        if (filters.sizes && filters.sizes.length > 0) {
          matchStage.sizes = { $in: filters.sizes }
        }
        if (filters.category) {
          try {
            const { ObjectId } = await import('mongodb')
            const catId = new ObjectId(filters.category)
            matchStage.$or = [
              { categoryId: filters.category },
              { categoryId: catId }
            ]
          } catch {
            matchStage.categoryId = filters.category
          }
        }
        if (filters.brand) {
          try {
            const { ObjectId } = await import('mongodb')
            const brandIdObj = new ObjectId(filters.brand)
            if (!matchStage.$or) {
              matchStage.$or = []
            }
            const brandMatch = [
              { brandId: filters.brand },
              { brandId: brandIdObj }
            ]
            if (matchStage.$or.length > 0) {
              matchStage.$and = [
                { $or: matchStage.$or },
                { $or: brandMatch }
              ]
              delete matchStage.$or
            } else {
              matchStage.$or = brandMatch
            }
          } catch {
            matchStage.brandId = filters.brand
          }
        }

        // Count using the same match filter (fast, no lookups)
        total = await DatabaseService.count('products', matchStage)

        // Fetch page of products with minimal relation lookups
        products = await ProductService.findProductsWithRelations(filters, pagination)
      }

      const durationMs = Date.now() - t0
      if (durationMs > 1000) {
        console.warn('[Slow] GET /api/products', {
          durationMs,
          page,
          limit,
          search,
          category,
          brand,
          minPrice,
          maxPrice,
          sortBy,
          sortOrder,
          featured,
          sizes,
          count: products.length
        })
      }

      return NextResponse.json({
        success: true,
        data: products,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.max(1, Math.ceil(total / limit))
        }
      }, {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
          'Content-Type': 'application/json'
        }
      })
    } catch (dbError) {
      return NextResponse.json({
        success: true,
        data: [],
        pagination: { page, limit, total: 0, totalPages: 0 }
      })
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

// POST /api/products - Create new product (Admin only)
export const POST = withAdminAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { 
      name, 
      description, 
      categoryId, 
      brandId, 
      price, 
      offerPrice, 
      stock, 
      sku, 
      sizes, 
      sizeStocks,
      tags, 
      images, 
      galleryImages,
      sizeChart,
      isActive,
      hasVariants,
      variants
    } = body

    if (!name || !categoryId || !brandId || !price) {
      return NextResponse.json(
        { success: false, error: 'Name, category, brand, and price are required' },
        { status: 400 }
      )
    }

    // Check if product with same SKU already exists
    if (sku) {
      const existingProduct = await DatabaseService.findOne('products', { sku })
      if (existingProduct) {
        return NextResponse.json(
          { success: false, error: 'Product with this SKU already exists' },
          { status: 409 }
        )
      }
    }

    const productData = {
      name: name.trim(),
      description: description || '',
      categoryId,
      brandId,
      price: parseFloat(price),
      offerPrice: offerPrice ? parseFloat(offerPrice) : null,
      stock: parseInt(stock) || 0,
      sku: sku || '',
      sizes: sizes || [],
      sizeStocks: sizeStocks || [],
      tags: tags || [],
      images: images || [],
      galleryImages: galleryImages || [],
      sizeChart: sizeChart || '',
      isActive: isActive !== undefined ? isActive : true,
      featured: false,
      rating: 0,
      reviewCount: 0,
      hasVariants: hasVariants || false,
      variants: variants || []
    }

    const product = await DatabaseService.create('products', productData)

    return NextResponse.json({
      success: true,
      data: product,
      message: 'Product created successfully',
    })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    )
  }
})