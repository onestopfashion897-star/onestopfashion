import nodemailer from 'nodemailer'

interface EmailConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
}

interface OrderConfirmationData {
  orderId: string
  customerName: string
  customerEmail: string
  items: Array<{
    name: string
    quantity: number
    price: number
    size?: string
  }>
  totalAmount: number
  shippingAddress: {
    fullName: string
    address: string
    city: string
    state: string
    pincode: string
    phone: string
  }
  paymentMethod: string
  paymentId?: string
  estimatedDelivery: string
}

interface PasswordResetData {
  customerName: string
  customerEmail: string
  newPassword: string
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null

  private async getTransporter() {
    if (this.transporter) {
      return this.transporter
    }

    // Email configuration - using provided Gmail credentials
    const config: EmailConfig = {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'onestopfashionbrand@gmail.com',
        pass: 'xvxy txny xtgj qjzt'
      }
    }

    this.transporter = nodemailer.createTransport(config)
    return this.transporter
  }

  async sendOrderConfirmation(data: OrderConfirmationData): Promise<boolean> {
    try {
      const transporter = await this.getTransporter()
      
      if (!transporter) {
        console.error('Failed to create email transporter')
        return false
      }

      const htmlContent = this.generateOrderConfirmationHTML(data)
      const textContent = this.generateOrderConfirmationText(data)

      const mailOptions = {
        from: '"One Stop Fashion" <onestopfashionbrand@gmail.com>',
        to: data.customerEmail,
        subject: `Order Confirmation - ${data.orderId}`,
        text: textContent,
        html: htmlContent
      }

      const result = await transporter.sendMail(mailOptions)
      console.log('Order confirmation email sent:', result.messageId)
      return true
    } catch (error) {
      console.error('Error sending order confirmation email:', error)
      return false
    }
  }

  async sendPasswordReset(data: PasswordResetData): Promise<boolean> {
    try {
      const transporter = await this.getTransporter()
      
      if (!transporter) {
        console.error('Failed to create email transporter')
        return false
      }

      const htmlContent = this.generatePasswordResetHTML(data)
      const textContent = this.generatePasswordResetText(data)

      const mailOptions = {
        from: '"One Stop Fashion" <onestopfashionbrand@gmail.com>',
        to: data.customerEmail,
        subject: 'Password Reset - One Stop Fashion',
        text: textContent,
        html: htmlContent
      }

      const result = await transporter.sendMail(mailOptions)
      console.log('Password reset email sent:', result.messageId)
      return true
    } catch (error) {
      console.error('Error sending password reset email:', error)
      return false
    }
  }

  private generateOrderConfirmationHTML(data: OrderConfirmationData): string {
    const itemsHTML = data.items.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">
          ${item.name}${item.size ? ` (Size: ${item.size})` : ''}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">
          ${item.quantity}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">
          ₹${item.price.toFixed(2)}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">
          ₹${(item.price * item.quantity).toFixed(2)}
        </td>
      </tr>
    `).join('')

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">Thank You for Your Order!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your order has been confirmed and is being processed</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #ddd; border-top: none;">
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <h2 style="margin: 0 0 15px 0; color: #2c3e50;">Order Details</h2>
            <p style="margin: 5px 0;"><strong>Order ID:</strong> ${data.orderId}</p>
            <p style="margin: 5px 0;"><strong>Order Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p style="margin: 5px 0;"><strong>Payment Method:</strong> ${data.paymentMethod}</p>
            ${data.paymentId ? `<p style="margin: 5px 0;"><strong>Payment ID:</strong> ${data.paymentId}</p>` : ''}
            <p style="margin: 5px 0;"><strong>Estimated Delivery:</strong> ${data.estimatedDelivery}</p>
          </div>

          <h3 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">Order Items</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
            <thead>
              <tr style="background: #f8f9fa;">
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Product</th>
                <th style="padding: 12px; text-align: center; border-bottom: 2px solid #ddd;">Qty</th>
                <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ddd;">Price</th>
                <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ddd;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
            <tfoot>
              <tr style="background: #f8f9fa;">
                <td colspan="3" style="padding: 15px; text-align: right; font-weight: bold; font-size: 18px;">
                  Total Amount:
                </td>
                <td style="padding: 15px; text-align: right; font-weight: bold; font-size: 18px; color: #27ae60;">
                  ₹${data.totalAmount.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>

          <h3 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">Shipping Address</h3>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <p style="margin: 5px 0;"><strong>${data.shippingAddress.fullName}</strong></p>
            <p style="margin: 5px 0;">${data.shippingAddress.address}</p>
            <p style="margin: 5px 0;">${data.shippingAddress.city}, ${data.shippingAddress.state} - ${data.shippingAddress.pincode}</p>
            <p style="margin: 5px 0;">Phone: ${data.shippingAddress.phone}</p>
          </div>

          <div style="background: #e8f5e8; border: 1px solid #27ae60; border-radius: 8px; padding: 20px; text-align: center;">
            <h3 style="margin: 0 0 10px 0; color: #27ae60;">What's Next?</h3>
            <p style="margin: 5px 0;">• You'll receive a shipping confirmation email once your order is dispatched</p>
            <p style="margin: 5px 0;">• Track your order anytime at onestopfashionbrand.com/track-order</p>
            <p style="margin: 5px 0;">• Contact us at onestopfashionbrand@gmail.com for any questions</p>
          </div>
        </div>

        <div style="background: #2c3e50; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
          <p style="margin: 0; font-size: 14px;">
            Thank you for shopping with One Stop Fashion!<br>
            <a href="mailto:support@onestopfashionbrand.com" style="color: #3498db;">support@onestopfashionbrand.com</a> | 
            <a href="tel:+919876543210 " style="color: #3498db;">+91 97694 95910</a>
          </p>
        </div>
      </body>
      </html>
    `
  }

  private generateOrderConfirmationText(data: OrderConfirmationData): string {
    const itemsText = data.items.map(item => 
      `${item.name}${item.size ? ` (Size: ${item.size})` : ''} - Qty: ${item.quantity} - ₹${(item.price * item.quantity).toFixed(2)}`
    ).join('\n')

    return `
Thank You for Your Order!

Order Details:
- Order ID: ${data.orderId}
- Order Date: ${new Date().toLocaleDateString()}
- Payment Method: ${data.paymentMethod}
${data.paymentId ? `- Payment ID: ${data.paymentId}` : ''}
- Estimated Delivery: ${data.estimatedDelivery}

Order Items:
${itemsText}

Total Amount: ₹${data.totalAmount.toFixed(2)}

Shipping Address:
${data.shippingAddress.fullName}
${data.shippingAddress.address}
${data.shippingAddress.city}, ${data.shippingAddress.state} - ${data.shippingAddress.pincode}
Phone: ${data.shippingAddress.phone}

What's Next?
• You'll receive a shipping confirmation email once your order is dispatched
• Track your order anytime at onestopfashionbrand.com/track-order
• Contact us at support@onestopfashionbrand.com for any questions

Thank you for shopping with One Stop Fashion!
support@onestopfashionbrand.com | +91 98765 43210
    `
  }

  private generatePasswordResetHTML(data: PasswordResetData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset - One Stop Fashion</title>
      </head>
      <body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <div style="background: linear-gradient(135deg, #3498db, #2c3e50); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Password Reset</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your new password is ready</p>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #ddd; border-top: none;">
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
              <h2 style="margin: 0 0 15px 0; color: #2c3e50;">Hello ${data.customerName}!</h2>
              <p style="margin: 5px 0; color: #555;">We've generated a new password for your One Stop Fashion account as requested.</p>
            </div>

            <div style="background: #e8f4fd; border: 2px solid #3498db; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
              <h3 style="margin: 0 0 10px 0; color: #2c3e50;">Your New Password</h3>
              <div style="background: white; padding: 15px; border-radius: 5px; font-family: monospace; font-size: 18px; font-weight: bold; color: #2c3e50; letter-spacing: 1px;">
                ${data.newPassword}
              </div>
              <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">Please copy this password and keep it safe</p>
            </div>

            <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #856404;">Important Security Notice</h3>
              <p style="margin: 5px 0; color: #856404; font-size: 14px;">• Please change this password after logging in</p>
              <p style="margin: 5px 0; color: #856404; font-size: 14px;">• Use a strong, unique password for your account</p>
              <p style="margin: 5px 0; color: #856404; font-size: 14px;">• Never share your password with anyone</p>
            </div>



            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 30px;">
              <h3 style="margin: 0 0 10px 0; color: #27ae60;">Need Help?</h3>
              <p style="margin: 5px 0;">• Contact us at onestopfashionbrand@gmail.com for any questions</p>
              <p style="margin: 5px 0;">• Visit our help center for account security tips</p>
            </div>
          </div>

          <div style="background: #2c3e50; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
            <p style="margin: 0; font-size: 14px;">
              Thank you for choosing One Stop Fashion!<br>
              <a href="mailto:onestopfashionbrand@gmail.com" style="color: #3498db;">onestopfashionbrand@gmail.com</a> | 
              <a href="tel:+919876543210 " style="color: #3498db;">+91 97694 95910</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  private generatePasswordResetText(data: PasswordResetData): string {
    return `
Password Reset - One Stop Fashion

Hello ${data.customerName}!

We've generated a new password for your One Stop Fashion account as requested.

Your New Password: ${data.newPassword}

Important Security Notice:
• Please change this password after logging in
• Use a strong, unique password for your account
• Never share your password with anyone

Login to your account

Need Help?
• Contact us at support@onestopfashionbrandshionbrand.com for any questions
• Visit our help center for account security tips

Thank you for choosing One Stop Fashion!
onestopfashionbrand@gmail.com | +91 97694 95910
    `
  }
}

export const emailService = new EmailService()
export type { OrderConfirmationData, PasswordResetData }