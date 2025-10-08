import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService, ProductService, CategoryService } from '@/lib/models'
import { Product, ProductFilters, PaginationParams } from '@/lib/types'
import { withAdminAuth } from '@/lib/auth'

// GET /api/products - Get all products with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    console.log('Products API called')
    console.log('MONGODB_URI:', process.env.MONGODB_URI || 'mongodb://localhost:27017/stylehub')
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
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

    console.log('Query parameters:', { page, limit, search, category, brand, featured, isFeatured, deal })

    const pagination: PaginationParams = { page, limit, sortBy, sortOrder }

    let products: Product[] = []
    
    try {
      if (search) {
        // Search products
        products = await ProductService.searchProducts(search, pagination)
      } else {
        // Convert category slug to ObjectId if provided
        let categoryId = category
        if (category) {
          const categoryDoc = await CategoryService.findBySlug(category)
          if (categoryDoc) {
            categoryId = categoryDoc._id!.toString()
          } else {
            // If category slug doesn't exist, return empty results
            return NextResponse.json({
              success: true,
              data: [],
              pagination: {
                page,
                limit,
                total: 0,
                totalPages: 0
              }
            })
          }
        }
        
        // Filter products with relationships
        const filters: ProductFilters = {
          category: categoryId,
          brand,
          minPrice: minPrice ? parseFloat(minPrice) : undefined,
          maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
          featured: (featured === 'true' || isFeatured === 'true') ? true : (featured === 'false' ? false : undefined),
          sizes: sizes ? sizes.split(',') : undefined
        }
        
        products = await ProductService.findProductsWithRelations(filters, pagination)
      }

      // Get total count for pagination
      const total = await DatabaseService.count('products', { isActive: true })
      const totalPages = Math.ceil(total / limit)

      console.log(`Found ${products.length} products`)

      return NextResponse.json({
        success: true,
        data: products,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      })
    } catch (dbError) {
      console.error('Database error in products API:', dbError)
      
      // Return empty data instead of failing completely
      return NextResponse.json({
        success: true,
        data: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0
        },
        message: 'Database connection issue - returning empty results'
      })
    }
  } catch (error) {
    console.error('Error in products API:', error)
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