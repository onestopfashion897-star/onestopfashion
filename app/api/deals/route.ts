import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/models'
import { withAdminAuth } from '@/lib/auth'

// GET /api/deals - Get all deals
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const active = searchParams.get('active')
    const type = searchParams.get('type') // 'daily', 'flash', 'weekend', etc.

    let filter: any = {}
    
    if (active === 'true') {
      filter.isActive = true
      filter.startDate = { $lte: new Date() }
      filter.endDate = { $gte: new Date() }
    }

    if (type) {
      filter.type = type
    }

    const deals = await DatabaseService.find('deals', filter, { 
      page, 
      limit,
      sortBy: 'priority',
      sortOrder: 'desc'
    })

    return NextResponse.json({
      success: true,
      data: deals,
    })
  } catch (error) {
    console.error('Error fetching deals:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch deals' },
      { status: 500 }
    )
  }
}

// POST /api/deals - Create new deal (Admin only)
export const POST = withAdminAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { 
      title, 
      description,
      type,
      discountType,
      discountValue,
      imageUrl,
      linkUrl,
      startDate,
      endDate,
      priority,
      isActive,
      applicableProducts,
      applicableCategories
    } = body

    if (!title || !type || !discountType || !discountValue || !startDate || !endDate) {
      return NextResponse.json(
        { success: false, error: 'Title, type, discount details, start date, and end date are required' },
        { status: 400 }
      )
    }

    // Validate dates
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    if (start >= end) {
      return NextResponse.json(
        { success: false, error: 'End date must be after start date' },
        { status: 400 }
      )
    }

    const dealData = {
      title: title.trim(),
      description: description || '',
      type: type, // 'daily', 'flash', 'weekend', 'seasonal'
      discountType: discountType, // 'percentage', 'fixed', 'buy_one_get_one'
      discountValue: parseFloat(discountValue),
      imageUrl: imageUrl || '',
      linkUrl: linkUrl || '',
      startDate: start,
      endDate: end,
      priority: priority || 0,
      isActive: isActive !== undefined ? isActive : true,
      applicableProducts: applicableProducts || [],
      applicableCategories: applicableCategories || [],
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const deal = await DatabaseService.create('deals', dealData)

    return NextResponse.json({
      success: true,
      data: deal,
      message: 'Deal created successfully',
    })
  } catch (error) {
    console.error('Error creating deal:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create deal' },
      { status: 500 }
    )
  }
})