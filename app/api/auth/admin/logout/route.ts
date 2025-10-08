import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('Admin logout API called')
    
    // Create response to clear the admin token cookie
    const response = NextResponse.json({
      success: true,
      message: 'Admin logged out successfully',
    })

    // Clear the admin token cookie
    response.cookies.set('adminToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // This will delete the cookie
      path: '/'
    })

    console.log('Admin token cookie cleared')
    return response
  } catch (error) {
    console.error('Error in admin logout API:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to logout' },
      { status: 500 }
    )
  }
}