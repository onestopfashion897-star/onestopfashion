import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/models'
import { withAdminAuth } from '@/lib/auth'

// GET /api/categories/[id] - Get category by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const category = await DatabaseService.findById('categories', params.id)
    
    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: category,
    })
  } catch (error) {
    console.error('Error fetching category:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch category' },
      { status: 500 }
    )
  }
}

// PUT /api/categories/[id] - Update category (Admin only)
export const PUT = withAdminAuth(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const body = await request.json()
    const { name, description, parentCategoryId, isActive } = body

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Category name is required' },
        { status: 400 }
      )
    }

    // Check if category exists
    const existingCategory = await DatabaseService.findById('categories', params.id)
    if (!existingCategory) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      )
    }

    // Generate slug from name
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-')

    // Check if category with same name or slug already exists (excluding current category)
    const duplicateCategory = await DatabaseService.findOne('categories', {
      $and: [
        { _id: { $ne: params.id } },
        { $or: [{ name: name.toLowerCase() }, { slug }] }
      ]
    })

    if (duplicateCategory) {
      return NextResponse.json(
        { success: false, error: 'Category with this name already exists' },
        { status: 409 }
      )
    }

    const updateData = {
      name: name.trim(),
      slug,
      description: description || '',
      parentCategoryId: parentCategoryId || null,
      isActive: isActive !== undefined ? isActive : true
    }

    const success = await DatabaseService.update('categories', params.id, updateData)
    
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to update category' },
        { status: 500 }
      )
    }

    // Get updated category
    const updatedCategory = await DatabaseService.findById('categories', params.id)

    return NextResponse.json({
      success: true,
      data: updatedCategory,
      message: 'Category updated successfully',
    })
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update category' },
      { status: 500 }
    )
  }
})

// DELETE /api/categories/[id] - Delete category (Admin only)
export const DELETE = withAdminAuth(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    // Check if category exists
    const existingCategory = await DatabaseService.findById('categories', params.id)
    if (!existingCategory) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      )
    }

    // Check if category has subcategories
    const subcategories = await DatabaseService.find('categories', { parentCategoryId: params.id })
    if (subcategories.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete category with subcategories' },
        { status: 400 }
      )
    }

    // Check if category has products
    const products = await DatabaseService.find('products', { categoryId: params.id })
    if (products.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete category with products' },
        { status: 400 }
      )
    }

    // Delete category
    const success = await DatabaseService.delete('categories', params.id)
    
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete category' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete category' },
      { status: 500 }
    )
  }
})