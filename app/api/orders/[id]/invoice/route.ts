import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { AuthService, withAuth } from '@/lib/auth'
import { DatabaseService } from '@/lib/models'

export const runtime = 'nodejs'

interface OrderItem {
  productId: string
  name: string
  price: number
  quantity: number
  size: string
  image?: string
}

interface ShippingAddress {
  name: string
  phone: string
  address: string
  city: string
  state: string
  pincode: string
}

interface Order {
  _id: string
  orderId: string
  userId: string
  items: OrderItem[]
  shippingAddress: ShippingAddress
  paymentMethod: string
  paymentStatus: string
  orderStatus: string
  subtotal: number
  shippingCost: number
  discount: number
  total: number
  razorpayOrderId?: string
  razorpayPaymentId?: string
  createdAt: string
}

export const GET = withAuth(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params
    if (!id) {
      return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 })
    }

    // Fetch order details
    const order = await DatabaseService.findById('orders', id) as Order
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 })
    }

    // Read authenticated user from request (set by withAuth)
    const authReq = request as any
    const user = authReq.user as { userId: string; email: string; role: string } | undefined

    const isAdmin = user ? AuthService.hasAdminRole(user.role) : false
    const orderUserId = (order as any).userId
    const orderUserIdStr = typeof orderUserId === 'string' ? orderUserId : orderUserId?.toString?.() ?? ''

    // Check if user owns this order or is an admin
    if (!user || (!isAdmin && orderUserIdStr !== user.userId)) {
      // Fallback: verify ownership directly in DB in case of unexpected type issues
      if (user) {
        try {
          const owns = await DatabaseService.findOne('orders', { _id: new ObjectId(id), userId: new ObjectId(user.userId) })
          if (!owns) {
            return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 })
          }
        } catch (e) {
          return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 })
        }
      } else {
        return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 })
      }
    }

    // Generate HTML content for PDF conversion
    const htmlInvoice = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Invoice - ${order.orderId}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; background: #fff; }
        .invoice-container { max-width: 800px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; padding: 40px; border-radius: 10px 10px 0 0; margin-bottom: 30px; }
        .header h1 { font-size: 32px; margin-bottom: 10px; }
        .company-info h2 { font-size: 24px; margin-bottom: 5px; }
        .company-info p { opacity: 0.9; }
        .invoice-meta { display: flex; justify-content: space-between; margin-bottom: 30px; padding: 20px; background: #f8fafc; border-radius: 8px; }
        .invoice-meta div { flex: 1; }
        .invoice-meta h3 { color: #1e40af; font-size: 14px; text-transform: uppercase; margin-bottom: 10px; }
        .invoice-meta p { margin: 5px 0; color: #334155; }
        .items-table { width: 100%; border-collapse: collapse; margin: 30px 0; }
        .items-table thead { background: #1e40af; color: white; }
        .items-table th { padding: 15px; text-align: left; font-weight: 600; }
        .items-table td { padding: 15px; border-bottom: 1px solid #e2e8f0; }
        .items-table tbody tr:hover { background: #f8fafc; }
        .totals { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 30px 0; }
        .totals-row { display: flex; justify-content: space-between; padding: 8px 0; }
        .totals-row.final { border-top: 2px solid #1e40af; margin-top: 10px; padding-top: 15px; font-size: 20px; font-weight: bold; color: #1e40af; }
        .footer { text-align: center; margin-top: 50px; padding-top: 30px; border-top: 2px solid #e2e8f0; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <div class="header">
          <h1>INVOICE</h1>
          <div class="company-info">
            <h2>HappyFeet - tech  Collection</h2>
            <p>Phone: +91 98765 43210 | Email: support@happyfeet.com</p>
          </div>
        </div>
        
        <div class="invoice-meta">
          <div>
            <h3>Order Details</h3>
            <p><strong>Order ID:</strong> ${order.orderId}</p>
            <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p><strong>Payment:</strong> ${order.paymentMethod}</p>
            <p><strong>Status:</strong> ${order.paymentStatus}</p>
            ${order.razorpayPaymentId ? `<p><strong>Payment ID:</strong> ${order.razorpayPaymentId}</p>` : ''}
          </div>
          <div>
            <h3>Shipping Address</h3>
            <p><strong>${order.shippingAddress.name}</strong></p>
            <p>${order.shippingAddress.address}</p>
            <p>${order.shippingAddress.city}, ${order.shippingAddress.state}</p>
            <p>${order.shippingAddress.pincode}</p>
            <p><strong>Phone:</strong> ${order.shippingAddress.phone}</p>
          </div>
        </div>
        
        <table class="items-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Size</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map(item => `
              <tr>
                <td><strong>${item.name}</strong></td>
                <td>${item.size}</td>
                <td>${item.quantity}</td>
                <td>₹${item.price.toLocaleString('en-IN')}</td>
                <td><strong>₹${(item.price * item.quantity).toLocaleString('en-IN')}</strong></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="totals">
          <div class="totals-row">
            <span>Subtotal:</span>
            <span>₹${order.subtotal.toLocaleString('en-IN')}</span>
          </div>
          <div class="totals-row">
            <span>Shipping:</span>
            <span>${order.shippingCost > 0 ? `₹${order.shippingCost.toLocaleString('en-IN')}` : 'Free'}</span>
          </div>
          ${order.discount > 0 ? `
          <div class="totals-row">
            <span>Discount:</span>
            <span>-₹${order.discount.toLocaleString('en-IN')}</span>
          </div>
          ` : ''}
          <div class="totals-row final">
            <span>Total Amount:</span>
            <span>₹${order.total.toLocaleString('en-IN')}</span>
          </div>
        </div>
        
        <div class="footer">
          <p><strong>Thank you for shopping with HappyFeet - tech  Collection!</strong></p>
          <p style="margin-top: 10px;">For any queries, contact us at support@happyfeet.com or +91 98765 43210</p>
        </div>
      </div>
    </body>
    </html>
    `

    // Generate PDF using Puppeteer (dynamic import to avoid webpack issues)
    const puppeteer = await import('puppeteer')
    
    // Production-friendly Puppeteer configuration
    const isProduction = process.env.NODE_ENV === 'production'
    
    // Log environment for debugging
    console.log('Puppeteer environment:', {
      NODE_ENV: process.env.NODE_ENV,
      PUPPETEER_EXECUTABLE_PATH: process.env.PUPPETEER_EXECUTABLE_PATH,
    })
    
    // Try different browser launch configurations
    let browser;
    try {
      // First attempt with production settings
      if (isProduction && process.env.PUPPETEER_EXECUTABLE_PATH) {
        console.log('Launching Puppeteer with custom executable path')
        browser = await puppeteer.default.launch({
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
          ],
          executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
        })
      } else {
        // Default launch configuration
        console.log('Launching Puppeteer with default configuration')
        browser = await puppeteer.default.launch({
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
          ]
        })
      }
    } catch (browserError) {
      console.error('First browser launch attempt failed:', browserError)
      
      // Fallback to minimal configuration
      console.log('Trying fallback browser launch configuration')
      browser = await puppeteer.default.launch({
        headless: true,
        args: ['--no-sandbox']
      })
    }
    
    const page = await browser.newPage()
    await page.setContent(htmlInvoice, { waitUntil: 'networkidle0' })
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    })
    
    await browser.close()

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${order.orderId}.pdf"`,
      },
    })

  } catch (error) {
    console.error('Error generating invoice:', error)
    
    // Provide more specific error messages for debugging
    let errorMessage = 'Failed to generate invoice'
    let statusCode = 500
    
    if (error instanceof Error) {
      console.error('Error details:', error.message, error.stack)
      
      // Log environment information for debugging
      console.error('Environment:', {
        NODE_ENV: process.env.NODE_ENV,
        PUPPETEER_EXECUTABLE_PATH: process.env.PUPPETEER_EXECUTABLE_PATH,
        PUPPETEER_SKIP_CHROMIUM_DOWNLOAD: process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD
      })
      
      if (error.message.includes('Could not find Chromium') || error.message.includes('executable path')) {
        errorMessage = 'PDF generation service temporarily unavailable. Please try again later.'
        console.error('Chromium not found. Check Puppeteer configuration and paths.')
      } else if (error.message.includes('Navigation timeout')) {
        errorMessage = 'PDF generation timed out. Please try again.'
      } else if (error.message.includes('Protocol error')) {
        errorMessage = 'Browser communication error. Please try again.'
      } else if (error.message.includes('net::ERR')) {
        errorMessage = 'Network error during PDF generation. Please check your connection and try again.'
      } else if (error.message.includes('spawn') || error.message.includes('ENOENT')) {
        errorMessage = 'PDF generation service configuration error. Please try again later.'
        console.error('Process spawn error. Check if Chromium is installed and accessible.')
      } else {
        errorMessage = `PDF generation failed. Please try again later.`
      }
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined,
        // Include minimal debug info even in production
        debug: process.env.NODE_ENV === 'production' ? { env: process.env.NODE_ENV } : undefined
      },
      { status: statusCode }
    )
  }
});