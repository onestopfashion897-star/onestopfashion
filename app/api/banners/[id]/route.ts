import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/models'
import { withAdminAuth } from '@/lib/auth'

// GET /api/banners/[id] - Get banner by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const banner = await DatabaseService.findById('banners', params.id)
    
    if (!banner) {
      return NextResponse.json(
        { success: false, error: 'Banner not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: banner,
    })
  } catch (error) {
    console.error('Error fetching banner:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch banner' },
      { status: 500 }
    )
  }
}

// PUT /api/banners/[id] - Update banner (Admin only)
export const PUT = withAdminAuth(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const body = await request.json()
    const { 
      title, 
      subtitle, 
      imageUrl, 
      mobileImageUrl,
      linkUrl, 
      linkText,
      order,
      isActive 
    } = body

    if (!title || !imageUrl) {
      return NextResponse.json(
        { success: false, error: 'Title and image URL are required' },
        { status: 400 }
      )
    }

    const updateData = {
      title: title.trim(),
      subtitle: subtitle || '',
      imageUrl: imageUrl.trim(),
      mobileImageUrl: mobileImageUrl || imageUrl.trim(),
      linkUrl: linkUrl || '',
      linkText: linkText || 'Shop Now',
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true,
      updatedAt: new Date()
    }

    const success = await DatabaseService.update('banners', params.id, updateData)
    
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to update banner' },
        { status: 500 }
      )
    }

    // Get updated banner
    const updatedBanner = await DatabaseService.findById('banners', params.id)

    return NextResponse.json({
      success: true,
      data: updatedBanner,
      message: 'Banner updated successfully',
    })
  } catch (error) {
    console.error('Error updating banner:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update banner' },
      { status: 500 }
    )
  }
})

// DELETE /api/banners/[id] - Delete banner (Admin only)
export const DELETE = withAdminAuth(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const success = await DatabaseService.delete('banners', params.id)
    
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete banner' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Banner deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting banner:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete banner' },
      { status: 500 }
    )
  }
})