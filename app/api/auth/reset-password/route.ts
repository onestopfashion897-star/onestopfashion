import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/models'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { email, otp, newPassword } = await request.json()

    if (!email || !otp || !newPassword) {
      return NextResponse.json({ success: false, error: 'All fields are required' }, { status: 400 })
    }

    const user = await DatabaseService.findOne('users', { email: email.toLowerCase() })
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    if (!user.resetOTP || !user.resetOTPExpiry) {
      return NextResponse.json({ success: false, error: 'No OTP request found' }, { status: 400 })
    }

    if (new Date() > new Date(user.resetOTPExpiry)) {
      return NextResponse.json({ success: false, error: 'OTP has expired' }, { status: 400 })
    }

    if (user.resetOTP !== otp) {
      return NextResponse.json({ success: false, error: 'Invalid OTP' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await DatabaseService.update('users', user._id!.toString(), {
      password: hashedPassword,
      resetOTP: null,
      resetOTPExpiry: null
    })

    return NextResponse.json({ success: true, message: 'Password reset successfully' })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json({ success: false, error: 'Failed to reset password' }, { status: 500 })
  }
}
