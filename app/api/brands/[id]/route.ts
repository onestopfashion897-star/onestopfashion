import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { DatabaseService } from '@/lib/models'
import { withAdminAuth } from '@/lib/auth'

// GET /api/brands/[id] - Get brand by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const brand = await DatabaseService.findById('brands', id)
    
    if (!brand) {
      return NextResponse.json(
        { success: false, error: 'Brand not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: brand,
    })
  } catch (error) {
    console.error('Error fetching brand:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch brand' },
      { status: 500 }
    )
  }
}

// PUT /api/brands/[id] - Update brand (Admin only)
export const PUT = withAdminAuth(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, description, logoUrl, website, isActive } = body

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Brand name is required' },
        { status: 400 }
      )
    }

    // Check if brand exists
    const existingBrand = await DatabaseService.findById('brands', id)
    if (!existingBrand) {
      return NextResponse.json(
        { success: false, error: 'Brand not found' },
        { status: 404 }
      )
    }

    // Generate slug from name
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-')

    // Check if brand with same name or slug already exists (excluding current brand)
    const duplicateBrand = await DatabaseService.findOne('brands', {
      $and: [
        { _id: { $ne: new ObjectId(id) } },
        { $or: [
          { name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } }, 
          { slug }
        ] }
      ]
    })

    if (duplicateBrand) {
      return NextResponse.json(
        { success: false, error: 'Brand with this name already exists' },
        { status: 409 }
      )
    }

    const updateData = {
      name: name.trim(),
      slug,
      description: description || '',
      logoUrl: logoUrl || '',
      website: website || '',
      isActive: isActive !== undefined ? isActive : true
    }

    const success = await DatabaseService.update('brands', id, updateData)
    
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to update brand' },
        { status: 500 }
      )
    }

    // Get updated brand
    const updatedBrand = await DatabaseService.findById('brands', id)

    return NextResponse.json({
      success: true,
      data: updatedBrand,
      message: 'Brand updated successfully',
    })
  } catch (error) {
    console.error('Error updating brand:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update brand' },
      { status: 500 }
    )
  }
})

// DELETE /api/brands/[id] - Delete brand (Admin only)
export const DELETE = withAdminAuth(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params
    
    // Check if brand exists
    const existingBrand = await DatabaseService.findById('brands', id)
    if (!existingBrand) {
      return NextResponse.json(
        { success: false, error: 'Brand not found' },
        { status: 404 }
      )
    }

    // Check if brand has products
    const products = await DatabaseService.find('products', { brandId: new ObjectId(id) })
    if (products.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete brand with products' },
        { status: 400 }
      )
    }

    // Delete brand
    const success = await DatabaseService.delete('brands', id)
    
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete brand' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Brand deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting brand:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete brand' },
      { status: 500 }
    )
  }
})