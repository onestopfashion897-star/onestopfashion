import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/models'
import { withAdminAuth } from '@/lib/auth'
import { ObjectId } from 'mongodb'

// GET /api/users - Get all users (Admin only)
export const GET = withAdminAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''

    let matchFilter: any = {}
    
    if (search) {
      matchFilter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ]
    }
    
    if (status) {
      matchFilter.isActive = status === 'active'
    }

    // Use aggregation pipeline to include order statistics
    const pipeline = [
      { $match: matchFilter },
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'userId',
          as: 'orders'
        }
      },
      {
        $addFields: {
          orderCount: { $size: '$orders' },
          totalSpent: {
            $sum: {
              $map: {
                input: '$orders',
                as: 'order',
                in: '$$order.total'
              }
            }
          }
        }
      },
      {
        $project: {
          orders: 0 // Remove the orders array from the result
        }
      },
      { $skip: (page - 1) * limit },
      { $limit: limit }
    ]

    const users = await DatabaseService.aggregate('users', pipeline)

    return NextResponse.json({
      success: true,
      data: users,
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
})