import { NextRequest, NextResponse } from 'next/server'
import { RazorpayService } from '@/lib/razorpay'
import { AuthService } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const token = AuthService.extractToken(request)
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const decoded = AuthService.validateToken(token)
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { amount, currency = 'INR', receipt, notes } = body

    // Validate required fields
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valid amount is required' },
        { status: 400 }
      )
    }

    // Convert amount to paise (Razorpay requires amount in paise)
    const amountInPaise = Math.round(amount * 100)

    // Create Razorpay order
    const razorpayOrder = await RazorpayService.createOrder({
      amount: amountInPaise,
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      notes: notes || {}
    })

    return NextResponse.json({
      success: true,
      data: {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        receipt: razorpayOrder.receipt
      }
    })

  } catch (error) {
    console.error('Error creating Razorpay order:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create payment order' },
      { status: 500 }
    )
  }
}