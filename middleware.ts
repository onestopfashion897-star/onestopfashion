import { NextRequest, NextResponse } from 'next/server'

// Simple JWT validation for Edge Runtime
function validateTokenSimple(token: string): { userId: string; email: string; role: string } | null {
  try {
    if (!token) return null
    
    // Split JWT token
    const parts = token.split('.')
    if (parts.length !== 3) return null
    
    // Decode payload (base64url)
    const payload = JSON.parse(
      Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString()
    )
    
    // Check expiration
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null
    }
    
    // Validate required fields
    if (!payload.userId || !payload.email || !payload.role) {
      return null
    }
    
    return {
      userId: payload.userId,
      email: payload.email,
      role: payload.role
    }
  } catch (error) {
    return null
  }
}

function hasAdminRole(role: string): boolean {
  return role === 'admin' || role === 'super_admin'
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const searchParams = request.nextUrl.searchParams

  // Determine order API paths that should be accessible without admin role
  const isAllowedOrderPath = (
    (pathname === '/api/orders' && request.method === 'POST') ||
    pathname.startsWith('/api/orders/my-orders') ||
    pathname.startsWith('/api/orders/track') ||
    (/^\/api\/orders\/[^/]+(?:\/(invoice|send-confirmation))?$/.test(pathname) && request.method === 'GET') ||
    (/^\/api\/orders\/[^/]+\/cancel-payment$/.test(pathname) && request.method === 'POST')
  )
  
  // Determine reviews API paths that should be admin-only
  const isReviewsPath = pathname.startsWith('/api/reviews')
  const isVerifyPurchasePath = pathname.startsWith('/api/reviews/verify-purchase')
  const isAdminOnlyReviewsEndpoint = isReviewsPath && (
    request.method === 'PUT' ||
    request.method === 'DELETE' ||
    (request.method === 'GET' && !searchParams.has('productId') && !searchParams.has('userId'))
  ) && !isVerifyPurchasePath
  
  // Skip middleware for static files and API routes that don't need protection
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth/admin/login') ||
    pathname.startsWith('/api/products') ||
    pathname.startsWith('/api/categories') ||
    pathname.startsWith('/api/brands') ||
    isAllowedOrderPath ||
    pathname.includes('.') // Skip files with extensions
  ) {
    return NextResponse.next()
  }

  // Handle admin routes
  if (pathname.startsWith('/admin')) {
    // Get token from cookies or Authorization header
    const cookieToken = request.cookies.get('adminToken')?.value
    const authHeader = request.headers.get('authorization')
    const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null
    const token = cookieToken || headerToken

    // Handle /admin/login specifically - redirect to admin-access page
    if (pathname === '/admin/login') {
      return NextResponse.redirect(new URL('/admin-access', request.url))
    }

    // For all other admin routes, require admin authentication
    if (!token) {
      // No token - redirect to homepage (not admin login)
      return NextResponse.redirect(new URL('/', request.url))
    }

    const decoded = validateTokenSimple(token)
    if (!decoded) {
      // Invalid token - redirect to homepage (not admin login)
      return NextResponse.redirect(new URL('/', request.url))
    }

    if (!hasAdminRole(decoded.role)) {
      // Valid token but not admin role - redirect to home
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Valid admin token - allow access
    return NextResponse.next()
  }

  // Handle admin API routes
  if (
      pathname.startsWith('/api/admin') || 
      pathname.startsWith('/api/users') ||
      (pathname.startsWith('/api/coupons') && !pathname.startsWith('/api/coupons/validate')) ||
      isAdminOnlyReviewsEndpoint ||
      (pathname.startsWith('/api/orders') && !isAllowedOrderPath)
  ) {
    // Get token from cookies or Authorization header
    const cookieToken = request.cookies.get('adminToken')?.value
    const authHeader = request.headers.get('authorization')
    const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null
    const token = cookieToken || headerToken

    if (!token) {
      return NextResponse.json({ success: false, error: 'No token provided' }, { status: 401 })
    }

    const decoded = validateTokenSimple(token)
    if (!decoded) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 })
    }

    if (!hasAdminRole(decoded.role)) {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 })
    }

    // Add user info to headers for API routes
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', decoded.userId)
    requestHeaders.set('x-user-email', decoded.email)
    requestHeaders.set('x-user-role', decoded.role)

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/api/users/:path*',
    '/api/orders/:path*',
    '/api/coupons/:path*',
    '/api/reviews/:path*'
  ]
}