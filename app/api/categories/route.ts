import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/models'
import { withAdminAuth } from '@/lib/auth'

// GET /api/categories - Get all categories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const isActive = searchParams.get('isActive')
    const limit = parseInt(searchParams.get('limit') || '100')

    let filter: any = {}
    if (isActive === 'true') {
      filter.isActive = true
    }

    const categories = await DatabaseService.find('categories', filter, { page: 1, limit })

    return NextResponse.json({
      success: true,
      data: categories || [],
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({
      success: true,
      data: [],
    })
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
