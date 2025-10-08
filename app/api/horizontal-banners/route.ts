import { NextRequest, NextResponse } from 'next/server'
import { HorizontalBannerService } from '@/lib/models'
import { withAdminAuth } from '@/lib/auth'

// GET /api/horizontal-banners - Get all horizontal banners
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('active') === 'true'

    const banners = await HorizontalBannerService.getAllBanners(activeOnly)

    return NextResponse.json({
      success: true,
      data: banners,
    })
  } catch (error) {
    console.error('Error fetching horizontal banners:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch horizontal banners' },
      { status: 500 }
    )
  }
}

// POST /api/horizontal-banners - Create new horizontal banner (Admin only)
export const POST = withAdminAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { imageUrl, linkUrl, index, isActive } = body

    if (!imageUrl) {
      return NextResponse.json(
        { success: false, error: 'Image URL is required' },
        { status: 400 }
      )
    }

    const bannerData = {
      imageUrl: imageUrl.trim(),
      linkUrl: linkUrl?.trim() || '',
      index: index || 1,
      isActive: isActive !== undefined ? isActive : true,
    }

    const banner = await HorizontalBannerService.createBanner(bannerData)

    return NextResponse.json({
      success: true,
      data: banner,
      message: 'Horizontal banner created successfully',
    })
  } catch (error) {
    console.error('Error creating horizontal banner:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create horizontal banner' },
      { status: 500 }
    )
  }
})

// PUT /api/horizontal-banners - Reorder banners (Admin only)
export const PUT = withAdminAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { bannerIds } = body

    if (!Array.isArray(bannerIds)) {
      return NextResponse.json(
        { success: false, error: 'Banner IDs array is required' },
        { status: 400 }
      )
    }

    const success = await HorizontalBannerService.reorderBanners(bannerIds)

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to reorder banners' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Banners reordered successfully',
    })
  } catch (error) {
    console.error('Error reordering horizontal banners:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to reorder horizontal banners' },
      { status: 500 }
    )
  }
})