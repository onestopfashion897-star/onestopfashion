import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/models'
import { withAdminAuth } from '@/lib/auth'

// GET /api/banners - Get all banners
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const active = searchParams.get('active')

    let filter: any = {}
    if (active === 'true') {
      filter.isActive = true
    }

    const banners = await DatabaseService.find('banners', filter, { 
      page, 
      limit,
      sortBy: 'order',
      sortOrder: 'asc'
    })

    return NextResponse.json({
      success: true,
      data: banners,
    })
  } catch (error) {
    console.error('Error fetching banners:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch banners' },
      { status: 500 }
    )
  }
}

// POST /api/banners - Create new banner (Admin only)
export const POST = withAdminAuth(async (request: NextRequest) => {
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

    const bannerData = {
      title: title.trim(),
      subtitle: subtitle || '',
      imageUrl: imageUrl.trim(),
      mobileImageUrl: mobileImageUrl || imageUrl.trim(),
      linkUrl: linkUrl || '',
      linkText: linkText || 'Shop Now',
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const banner = await DatabaseService.create('banners', bannerData)

    return NextResponse.json({
      success: true,
      data: banner,
      message: 'Banner created successfully',
    })
  } catch (error) {
    console.error('Error creating banner:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create banner' },
      { status: 500 }
    )
  }
})