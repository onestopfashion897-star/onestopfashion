import { NextRequest, NextResponse } from 'next/server'
import { HorizontalBannerService } from '@/lib/models'
import { withAdminAuth } from '@/lib/auth'

// GET /api/horizontal-banners/[id] - Get banner by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const banner = await HorizontalBannerService.getBannerById(params.id)

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
    console.error('Error fetching horizontal banner:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch horizontal banner' },
      { status: 500 }
    )
  }
}

// PUT /api/horizontal-banners/[id] - Update banner (Admin only)
export const PUT = withAdminAuth(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const body = await request.json()
    const { imageUrl, linkUrl, index, isActive } = body

    const updateData: any = {}
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl.trim()
    if (linkUrl !== undefined) updateData.linkUrl = linkUrl?.trim() || ''
    if (index !== undefined) updateData.index = index
    if (isActive !== undefined) updateData.isActive = isActive

    const success = await HorizontalBannerService.updateBanner(params.id, updateData)

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Banner not found or update failed' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Banner updated successfully',
    })
  } catch (error) {
    console.error('Error updating horizontal banner:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update horizontal banner' },
      { status: 500 }
    )
  }
})

// DELETE /api/horizontal-banners/[id] - Delete banner (Admin only)
export const DELETE = withAdminAuth(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const success = await HorizontalBannerService.deleteBanner(params.id)

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Banner not found or delete failed' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Banner deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting horizontal banner:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete horizontal banner' },
      { status: 500 }
    )
  }
})