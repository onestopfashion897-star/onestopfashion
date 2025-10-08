import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/models'
import { withAdminAuth } from '@/lib/auth'

// GET /api/brands - Get all brands
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''
    const isActive = searchParams.get('isActive')
    const withProducts = searchParams.get('withProducts')

    let filter: any = {}
    
    // Add isActive filter if specified
    if (isActive === 'true') {
      filter.isActive = true
    } else if (isActive === 'false') {
      filter.isActive = false
    }

    let brands
    if (search) {
      const searchRegex = { $regex: search, $options: 'i' }
      brands = await DatabaseService.find('brands', {
        ...filter,
        $or: [
          { name: searchRegex },
          { description: searchRegex }
        ]
      }, { page, limit })
    } else {
      brands = await DatabaseService.find('brands', filter, { page, limit })
    }

    // Get product count for each brand
    const brandsWithProductCount = await Promise.all(
      brands.map(async (brand: any) => {
        const productCount = await DatabaseService.count('products', { brandId: brand._id })
        return {
          ...brand,
          productCount
        }
      })
    )

    // Filter brands with products if requested
    let finalBrands = brandsWithProductCount
    if (withProducts === 'true') {
      finalBrands = brandsWithProductCount.filter((brand: any) => brand.productCount > 0)
    }

    return NextResponse.json({
      success: true,
      data: finalBrands,
    })
  } catch (error) {
    console.error('Error fetching brands:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch brands' },
      { status: 500 }
    )
  }
}

// POST /api/brands - Create new brand (Admin only)
export const POST = withAdminAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { name, description, logoUrl, website, isActive } = body

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Brand name is required' },
        { status: 400 }
      )
    }

    // Generate slug from name
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-')

    // Check if brand with same name or slug already exists
    const existingBrand = await DatabaseService.findOne('brands', {
      $or: [
        { name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } }, 
        { slug }
      ]
    })

    if (existingBrand) {
      return NextResponse.json(
        { success: false, error: 'Brand with this name already exists' },
        { status: 409 }
      )
    }

    const brandData = {
      name: name.trim(),
      slug,
      description: description || '',
      logoUrl: logoUrl || '',
      website: website || '',
      isActive: isActive !== undefined ? isActive : true
    }

    const brand = await DatabaseService.create('brands', brandData)

    return NextResponse.json({
      success: true,
      data: brand,
      message: 'Brand created successfully',
    })
  } catch (error) {
    console.error('Error creating brand:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create brand' },
      { status: 500 }
    )
  }
})