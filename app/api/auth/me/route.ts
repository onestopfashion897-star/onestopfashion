import { NextRequest, NextResponse } from 'next/server'
import { User } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    // Dynamic imports to avoid build-time issues
    const { AuthService } = await import('@/lib/auth')
    const { UserService, AdminService } = await import('@/lib/models')
    
    const token = AuthService.extractToken(request)
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'No token provided' },
        { status: 401 }
      )
    }

    const decoded = AuthService.validateToken(token)
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Try to find user first
    let user = await UserService.findById(decoded.userId)
    
    // If not found as user, try as admin
    if (!user) {
      const admin = await AdminService.findByEmail(decoded.email)
      if (admin) {
        // Convert admin to user format for consistent response
        const adminAsUser: Omit<User, 'password'> = {
          _id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role === 'super_admin' ? 'admin' : admin.role,
          addresses: [],
          isEmailVerified: true,
          isPhoneVerified: false,
          createdAt: admin.createdAt,
          updatedAt: admin.updatedAt,
        }
        user = adminAsUser as any
      }
    }
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      data: {
        user: userWithoutPassword,
      },
    })
  } catch (error) {
    console.error('Error in auth/me API:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}