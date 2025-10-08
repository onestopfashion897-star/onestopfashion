import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'
import { UserService } from '@/lib/models'
import { RegisterData } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const body: RegisterData = await request.json()
    const { name, email, phone, password } = body

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await UserService.findByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await AuthService.hashPassword(password)

    // Create user
    const user = await UserService.createUser({
      name,
      email: email.toLowerCase(),
      phone,
      password: hashedPassword,
      role: 'user',
      addresses: [],
      isEmailVerified: false,
      isPhoneVerified: false,
    })

    // Generate token
    const token = AuthService.generateToken({
      userId: user._id!.toString(),
      email: user.email,
      role: user.role,
    })

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      data: {
        user: userWithoutPassword,
        token,
      },
      message: 'User registered successfully',
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
} 