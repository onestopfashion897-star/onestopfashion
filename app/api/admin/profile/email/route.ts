import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Mock admin data - in a real app, this would be stored in a database
let adminData = {
  email: 'admin@happyfeet.com',
  password: 'admin123' // In real app, this would be hashed
}

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('adminToken')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify JWT token
    try {
      jwt.verify(token, JWT_SECRET)
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { newEmail } = await request.json()

    if (!newEmail) {
      return NextResponse.json({ error: 'New email is required' }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newEmail)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // Update admin email (in a real app, this would update the database)
    adminData.email = newEmail

    return NextResponse.json({ 
      message: 'Email updated successfully',
      email: newEmail 
    })

  } catch (error) {
    console.error('Error updating admin email:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}