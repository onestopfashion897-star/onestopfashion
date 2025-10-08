import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/models'
import { withAdminAuth } from '@/lib/auth'

// GET /api/categories - Get all categories
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

    let categories
    if (search) {
      const searchRegex = { $regex: search, $options: 'i' }
      categories = await DatabaseService.find('categories', {
        ...filter,
        $or: [
          { name: searchRegex },
          { description: searchRegex }
        ]
      }, { page, limit })
    } else {
      categories = await DatabaseService.find('categories', filter, { page, limit })
    }

    // Get product count for each category
    const categoriesWithProductCount = await Promise.all(
      categories.map(async (category: any) => {
        const productCount = await DatabaseService.count('products', { categoryId: category._id })
        return {
          ...category,
          productCount
        }
      })
    )

    // Filter categories with products if requested
    let finalCategories = categoriesWithProductCount
    if (withProducts === 'true') {
      finalCategories = categoriesWithProductCount.filter((category: any) => category.productCount > 0)
    }

    return NextResponse.json({
      success: true,
      data: finalCategories,
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

// POST /api/categories - Create new category (Admin only)
export const POST = withAdminAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { name, description, parentCategoryId, isActive } = body

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Category name is required' },
        { status: 400 }
      )
    }

    // Generate slug from name
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-')

    // Check if category with same name or slug already exists
    const existingCategory = await DatabaseService.findOne('categories', {
      $or: [{ name: name.toLowerCase() }, { slug }]
    })

    if (existingCategory) {
      return NextResponse.json(
        { success: false, error: 'Category with this name already exists' },
        { status: 409 }
      )
    }

    const categoryData = {
      name: name.trim(),
      slug,
      description: description || '',
      parentCategoryId: parentCategoryId || null,
      isActive: isActive !== undefined ? isActive : true,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const category = await DatabaseService.create('categories', categoryData)

    return NextResponse.json({
      success: true,
      data: category,
      message: 'Category created successfully',
    })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create category' },
      { status: 500 }
    )
  }
})