import { NextRequest, NextResponse } from 'next/server'
import { UserService } from '@/lib/models'
import { withAuth } from '@/lib/auth'

// Extend NextRequest to include user property
interface AuthenticatedRequest extends NextRequest {
  user?: { userId: string; email: string; role: string }
}

// GET /api/users/profile - Get current user profile
export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const userId = req.user!.userId
    
    const user = await UserService.findById(userId)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Remove sensitive data
    const { password, ...userProfile } = user
    
    return NextResponse.json({
      success: true,
      data: userProfile,
    })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
})

// PUT /api/users/profile - Update current user profile
export const PUT = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const userId = req.user!.userId
    const body = await req.json()
    
    const { name, email, phone, address } = body

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: 'Name and email are required' },
        { status: 400 }
      )
    }

    // Check if email is already taken by another user
    const existingUser = await UserService.findByEmail(email)
    if (existingUser && existingUser._id && existingUser._id.toString() !== userId) {
      return NextResponse.json(
        { success: false, error: 'Email is already taken' },
        { status: 409 }
      )
    }

    const updateData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone || '',
      address: address || '',
    }

    const success = await UserService.updateUser(userId, updateData)
    
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to update profile' },
        { status: 500 }
      )
    }

    // Get updated user data
    const updatedUser = await UserService.findById(userId)
    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: 'Profile updated successfully',
    })
  } catch (error) {
    console.error('Error updating user profile:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    )
  }
})