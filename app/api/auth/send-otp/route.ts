import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/models'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 })
    }

    const user = await DatabaseService.findOne('users', { email: email.toLowerCase() })
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000)

    await DatabaseService.update('users', user._id!.toString(), {
      resetOTP: otp,
      resetOTPExpiry: otpExpiry
    })

    console.log(`OTP for ${email}: ${otp}`)

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          },
          tls: {
            rejectUnauthorized: false
          }
        })

        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Password Reset OTP - One Stop Fashion',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #2563eb;">Password Reset OTP</h2>
              <p>Your OTP for password reset is:</p>
              <h1 style="color: #2563eb; font-size: 32px; letter-spacing: 5px; background: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px;">${otp}</h1>
              <p>This OTP will expire in 10 minutes.</p>
              <p style="color: #6b7280; font-size: 14px;">If you didn't request this, please ignore this email.</p>
            </div>
          `
        })
      } catch (emailError) {
        console.error('Email send error:', emailError)
      }
    }

    return NextResponse.json({ success: true, message: 'OTP sent to your email' })
  } catch (error) {
    console.error('Send OTP error:', error)
    return NextResponse.json({ success: false, error: 'Failed to send OTP' }, { status: 500 })
  }
}
