import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'
import { UserService, AdminService } from '@/lib/models'

export async function GET(request: NextRequest) {
  try {
    console.log('Admin auth/me API called')
    
    // Get token from cookies or Authorization header
    const cookieToken = request.cookies.get('adminToken')?.value
    const authHeader = request.headers.get('authorization')
    const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null
    const token = cookieToken || headerToken
    
    if (!token) {
      console.log('No admin token provided')
      return NextResponse.json(
        { success: false, error: 'No token provided' },
        { status: 401 }
      )
    }

    console.log('Admin token found, validating...')
    const decoded = AuthService.validateToken(token)
    if (!decoded) {
      console.log('Invalid admin token')
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Check if user has admin role
    if (!AuthService.hasAdminRole(decoded.role)) {
      console.log('User does not have admin role:', decoded.role)
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }

    console.log('Admin token validated, fetching admin...')

    // Try to find admin first
    let admin = await AdminService.findByEmail(decoded.email)
    
    // If not found as admin, try as user with admin role
    if (!admin) {
      console.log('Admin not found in admin collection, trying user collection...')
      const user = await UserService.findById(decoded.userId)
      if (user && AuthService.hasAdminRole(user.role)) {
        // Convert user to admin format for consistent response
        admin = {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role === 'super_admin' ? 'super_admin' : 'admin',
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        }
      }
    }
    
    if (!admin) {
      console.log('Admin not found in database')
      return NextResponse.json(
        { success: false, error: 'Admin not found' },
        { status: 404 }
      )
    }

    console.log('Admin found successfully')

    // Remove password from response if it exists
    const { password: _, ...adminWithoutPassword } = admin

    return NextResponse.json({
      success: true,
      admin: adminWithoutPassword,
    })
  } catch (error) {
    console.error('Error in admin auth/me API:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch admin' },
      { status: 500 }
    )
  }
}