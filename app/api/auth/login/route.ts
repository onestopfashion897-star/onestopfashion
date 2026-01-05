import { NextRequest, NextResponse } from 'next/server'
import { LoginCredentials, User } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const body: LoginCredentials = await request.json()
    const { email, password } = body

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Dynamic import to avoid build-time issues
    const { AuthService } = await import('@/lib/auth')

    // First try to authenticate as a regular user
    let result = await AuthService.authenticateUser(email.toLowerCase(), password)
    
    // If not found as user, try as admin
    if (!result) {
      const adminResult = await AuthService.authenticateAdmin(email.toLowerCase(), password)
      if (adminResult) {
        // Convert admin to user format for consistent response
        const adminAsUser: Omit<User, 'password'> = {
          _id: adminResult.admin._id,
          name: adminResult.admin.name,
          email: adminResult.admin.email,
          role: adminResult.admin.role === 'super_admin' ? 'admin' : adminResult.admin.role,
          addresses: [],
          isEmailVerified: true,
          isPhoneVerified: false,
          createdAt: adminResult.admin.createdAt,
          updatedAt: adminResult.admin.updatedAt,
        }
        
        result = {
          user: adminAsUser,
          token: adminResult.token
        }
      }
    }
    
    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Login successful',
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
} 