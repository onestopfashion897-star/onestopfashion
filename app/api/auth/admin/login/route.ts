import { NextRequest, NextResponse } from 'next/server'
import { LoginCredentials } from '@/lib/types'

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
    
    // Authenticate admin
    const result = await AuthService.authenticateAdmin(email.toLowerCase(), password)
    
    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Create response with admin token cookie
    const response = NextResponse.json({
      success: true,
      data: result,
      message: 'Admin login successful',
    })

    // Set admin token cookie
    response.cookies.set('adminToken', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    })

    return response
  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}