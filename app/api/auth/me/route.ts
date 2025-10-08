import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'
import { UserService, AdminService } from '@/lib/models'
import { User } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    console.log('Auth/me API called')
    console.log('MONGODB_URI:', process.env.MONGODB_URI || 'mongodb://localhost:27017/stylehub')
    
    const token = AuthService.extractToken(request)
    
    if (!token) {
      console.log('No token provided')
      return NextResponse.json(
        { success: false, error: 'No token provided' },
        { status: 401 }
      )
    }

    console.log('Token found, validating...')
    const decoded = AuthService.validateToken(token)
    if (!decoded) {
      console.log('Invalid token')
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      )
    }

    console.log('Token validated, fetching user...')

    // Try to find user first
    let user = await UserService.findById(decoded.userId)
    
    // If not found as user, try as admin
    if (!user) {
      console.log('User not found, trying admin...')
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
      console.log('User not found in database')
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    console.log('User found successfully')

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