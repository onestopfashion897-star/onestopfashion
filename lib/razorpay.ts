import Razorpay from 'razorpay'

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export interface RazorpayOrderOptions {
  amount: number // Amount in paise (multiply by 100)
  currency?: string
  receipt?: string
  notes?: Record<string, string>
}

export interface RazorpayOrder {
  id: string
  entity: string
  amount: number
  amount_paid: number
  amount_due: number
  currency: string
  receipt: string
  offer_id: string | null
  status: string
  attempts: number
  notes: Record<string, string>
  created_at: number
}

export interface RazorpayPaymentVerification {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

export class RazorpayService {
  /**
   * Create a new Razorpay order
   */
  static async createOrder(options: RazorpayOrderOptions): Promise<RazorpayOrder> {
    try {
      const order = await razorpay.orders.create({
        amount: options.amount,
        currency: options.currency || 'INR',
        receipt: options.receipt || `receipt_${Date.now()}`,
        notes: options.notes || {},
      })

      return order as RazorpayOrder
    } catch (error) {
      console.error('Error creating Razorpay order:', error)
      throw new Error('Failed to create payment order')
    }
  }

  /**
   * Verify payment signature
   */
  static verifyPaymentSignature(
    orderId: string,
    paymentId: string,
    signature: string
  ): boolean {
    try {
      const crypto = require('crypto')
      const body = orderId + '|' + paymentId
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
        .update(body.toString())
        .digest('hex')

      return expectedSignature === signature
    } catch (error) {
      console.error('Error verifying payment signature:', error)
      return false
    }
  }

  /**
   * Fetch payment details
   */
  static async getPayment(paymentId: string) {
    try {
      const payment = await razorpay.payments.fetch(paymentId)
      return payment
    } catch (error) {
      console.error('Error fetching payment:', error)
      throw new Error('Failed to fetch payment details')
    }
  }

  /**
   * Refund a payment
   */
  static async refundPayment(paymentId: string, amount?: number) {
    try {
      const refund = await razorpay.payments.refund(paymentId, {
        amount: amount, // Amount in paise, if not provided, full refund
      })
      return refund
    } catch (error) {
      console.error('Error processing refund:', error)
      throw new Error('Failed to process refund')
    }
  }

  /**
   * Handle webhook events
   */
  static verifyWebhookSignature(body: string, signature: string): boolean {
    try {
      const crypto = require('crypto')
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
        .update(body)
        .digest('hex')

      return expectedSignature === signature
    } catch (error) {
      console.error('Error verifying webhook signature:', error)
      return false
    }
  }
}

export default razorpay