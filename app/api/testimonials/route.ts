import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/models'
import { withAdminAuth } from '@/lib/auth'

// GET /api/testimonials - Get all testimonials
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const featured = searchParams.get('featured')
    const active = searchParams.get('active')

    let filter: any = {}
    
    if (featured === 'true') {
      filter.featured = true
    }
    
    if (active === 'true') {
      filter.isActive = true
    }

    const testimonials = await DatabaseService.find('testimonials', filter, { 
      page, 
      limit,
      sortBy: 'order',
      sortOrder: 'asc'
    })

    return NextResponse.json({
      success: true,
      data: testimonials,
    })
  } catch (error) {
    console.error('Error fetching testimonials:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch testimonials' },
      { status: 500 }
    )
  }
}

// POST /api/testimonials - Create new testimonial (Admin only)
export const POST = withAdminAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { 
      customerName,
      customerImage,
      customerLocation,
      rating,
      comment,
      productName,
      productImage,
      order,
      featured,
      isActive
    } = body

    if (!customerName || !rating || !comment) {
      return NextResponse.json(
        { success: false, error: 'Customer name, rating, and comment are required' },
        { status: 400 }
      )
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    const testimonialData = {
      customerName: customerName.trim(),
      customerImage: customerImage || '',
      customerLocation: customerLocation || '',
      rating: parseInt(rating),
      comment: comment.trim(),
      productName: productName || '',
      productImage: productImage || '',
      order: order || 0,
      featured: featured !== undefined ? featured : false,
      isActive: isActive !== undefined ? isActive : true,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const testimonial = await DatabaseService.create('testimonials', testimonialData)

    return NextResponse.json({
      success: true,
      data: testimonial,
      message: 'Testimonial created successfully',
    })
  } catch (error) {
    console.error('Error creating testimonial:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create testimonial' },
      { status: 500 }
    )
  }
})