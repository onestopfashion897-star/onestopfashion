import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { User, Admin } from './types'
import { DatabaseService } from './models'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const JWT_EXPIRES_IN = '7d'

export class AuthService {
  // Password hashing
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12
    return bcrypt.hash(password, saltRounds)
  }

  static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
  }

  // JWT token generation
  static generateToken(payload: { userId: string; email: string; role: string }): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
  }

  static verifyToken(token: string): any {
    try {
      return jwt.verify(token, JWT_SECRET)
    } catch (error) {
      return null
    }
  }

  // User authentication
  static async authenticateUser(email: string, password: string): Promise<{ user: Omit<User, 'password'>; token: string } | null> {
    const { UserService } = await import('./models')
    const user = await UserService.findByEmail(email)
    
    if (!user) {
      return null
    }

    const isValidPassword = await this.comparePassword(password, user.password)
    if (!isValidPassword) {
      return null
    }

    const token = this.generateToken({
      userId: user._id!.toString(),
      email: user.email,
      role: user.role
    })

    const { password: _, ...userWithoutPassword } = user
    return { user: userWithoutPassword, token }
  }

  // Admin authentication - checks both User and Admin collections
  static async authenticateAdmin(email: string, password: string): Promise<{ admin: any; token: string } | null> {
    try {
      // During build time, skip database operations
      if (process.env.NODE_ENV === 'production' && !process.env.VERCEL_ENV) {
        return null
      }

      // First try Admin collection
      const { AdminService } = await import('./models')
      const admin = await AdminService.findByEmail(email)
      
      if (admin) {
        const isValidPassword = await this.comparePassword(password, admin.password)
        if (isValidPassword) {
          const token = this.generateToken({
            userId: admin._id!.toString(),
            email: admin.email,
            role: admin.role
          })

          const { password: _, ...adminWithoutPassword } = admin
          return { admin: adminWithoutPassword, token }
        }
      }

      // If not found in Admin collection, try User collection with admin role
      const { UserService } = await import('./models')
      const user = await UserService.findByEmail(email)
      
      if (user && (user.role === 'admin' || user.role === 'super_admin')) {
        const isValidPassword = await this.comparePassword(password, user.password)
        if (isValidPassword) {
          const token = this.generateToken({
            userId: user._id!.toString(),
            email: user.email,
            role: user.role
          })

          const { password: _, ...userWithoutPassword } = user
          return { admin: userWithoutPassword, token }
        }
      }

      return null
    } catch (error) {
      console.error('Admin authentication error:', error)
      return null
    }
  }

  // Token validation
  static validateToken(token: string): { userId: string; email: string; role: string } | null {
    const decoded = this.verifyToken(token)
    if (!decoded) {
      return null
    }
    return decoded as { userId: string; email: string; role: string }
  }

  // Role-based access control
  static hasAdminRole(userRole: string): boolean {
    return userRole === 'admin' || userRole === 'super_admin'
  }

  // Extract token from Authorization header or cookies
  static extractToken(req: NextRequest): string | null {
    // Try Authorization header first
    const authHeader = req.headers.get('authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7)
    }

    // Try cookies
    const cookieToken = req.cookies.get('adminToken')?.value
    if (cookieToken) {
      return cookieToken
    }

    return null
  }

  // Verify user exists and has admin role
  static async verifyAdminUser(userId: string): Promise<boolean> {
    try {
      const { UserService, AdminService } = await import('./models')
      
      // Check Admin collection first - use DatabaseService directly since AdminService doesn't have findById
      const admin = await DatabaseService.findById('admins', userId)
      if (admin && this.hasAdminRole(admin.role)) {
        return true
      }

      // Check User collection
      const user = await UserService.findById(userId)
      if (user && this.hasAdminRole(user.role)) {
        return true
      }

      return false
    } catch (error) {
      console.error('Error verifying admin user:', error)
      return false
    }
  }
}

// Middleware for protecting regular user routes
export const withAuth = (handler: Function) => {
  return async (req: NextRequest, context?: any) => {
    try {
      const token = AuthService.extractToken(req)
      
      if (!token) {
        return NextResponse.json({ success: false, error: 'No token provided' }, { status: 401 })
      }

      const decoded = AuthService.validateToken(token)
      if (!decoded) {
        return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 })
      }

      // Add user info to request
      (req as any).user = decoded
      return handler(req, context)
    } catch (error) {
      return NextResponse.json({ success: false, error: 'Authentication failed' }, { status: 401 })
    }
  }
}

// Middleware for admin-only routes
export const withAdminAuth = (handler: Function) => {
  return async (req: NextRequest, context?: any) => {
    try {
      const token = AuthService.extractToken(req)
      
      if (!token) {
        return NextResponse.json({ success: false, error: 'No token provided' }, { status: 401 })
      }

      const decoded = AuthService.validateToken(token)
      if (!decoded) {
        return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 })
      }

      // Check if user has admin role
      if (!AuthService.hasAdminRole(decoded.role)) {
        return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 })
      }

      // Verify user still exists and has admin role in database
      const isValidAdmin = await AuthService.verifyAdminUser(decoded.userId)
      if (!isValidAdmin) {
        return NextResponse.json({ success: false, error: 'Admin access revoked' }, { status: 403 })
      }

      // Add user info to request
      (req as any).user = decoded
      return handler(req, context)
    } catch (error) {
      console.error('Admin auth error:', error)
      return NextResponse.json({ success: false, error: 'Authentication failed' }, { status: 401 })
    }
  }
}