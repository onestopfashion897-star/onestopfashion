import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

// Generate a random password
function generateRandomPassword(length: number = 12): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  let password = ''
  
  // Ensure at least one of each type
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)] // uppercase
  password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)] // lowercase
  password += '0123456789'[Math.floor(Math.random() * 10)] // number
  password += '!@#$%^&*'[Math.floor(Math.random() * 8)] // special char
  
  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)]
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('')
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    // Validate input
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Dynamic imports to avoid build-time issues
    const { UserService } = await import('@/lib/models')
    const { emailService } = await import('@/lib/email')

    // Check if user exists
    const user = await UserService.findByEmail(email.toLowerCase().trim())
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'No account found with this email address' },
        { status: 404 }
      )
    }

    // Generate new password
    const newPassword = generateRandomPassword(12)
    
    // Hash the new password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds)

    // Update user's password in database
    if (!user._id) {
      return NextResponse.json(
        { success: false, error: 'Invalid user data. Please try again.' },
        { status: 500 }
      )
    }

    const updateSuccess = await UserService.updateUser(user._id.toString(), {
      password: hashedPassword,
      updatedAt: new Date()
    })

    if (!updateSuccess) {
      return NextResponse.json(
        { success: false, error: 'Failed to update password. Please try again.' },
        { status: 500 }
      )
    }

    // Send password reset email
    const emailSent = await emailService.sendPasswordReset({
      customerName: user.name || 'Customer',
      customerEmail: user.email,
      newPassword: newPassword
    })

    if (!emailSent) {
      return NextResponse.json(
        { 
          success: true, 
          message: 'Password has been reset, but email delivery failed. Please contact support for your new password.',
          emailSent: false
        },
        { status: 200 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'A new password has been sent to your email address. Please check your inbox.',
      emailSent: true
    })

  } catch (error) {
    console.error('Error in forgot password:', error)
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    )
  }
}