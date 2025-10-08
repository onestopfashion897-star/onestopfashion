import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/auth'
import { DatabaseService } from '@/lib/models'

// PATCH /api/users/[id]/status - Update user status (Admin only)
export const PATCH = withAdminAuth(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const body = await request.json()
    const { isActive } = body

    const existingUser = await DatabaseService.findById('users', params.id)
    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    const updateData = {
      isActive: isActive,
      updatedAt: new Date()
    }

    const success = await DatabaseService.update('users', params.id, updateData)

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to update user status' },
        { status: 500 }
      )
    }

    const updatedUser = await DatabaseService.findById('users', params.id)

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
    })
  } catch (error) {
    console.error('Error updating user status:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update user status' },
      { status: 500 }
    )
  }
}) 