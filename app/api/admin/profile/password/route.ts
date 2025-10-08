import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth, AuthService } from '@/lib/auth'
import { UserService, AdminService, DatabaseService } from '@/lib/models'

export const PUT = withAdminAuth(async (request: NextRequest) => {
  try {
    const { currentPassword, newPassword } = await request.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Current password and new password are required' }, { status: 400 })
    }

    // Validate new password strength
    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'New password must be at least 6 characters long' }, { status: 400 })
    }

    // Get admin info from token
    const adminInfo = (request as any).user
    const userId = adminInfo.userId

    // Find admin in database (check both Admin and User collections)
    let admin: any = await DatabaseService.findById('admins', userId)
    let isUserCollection = false
    
    if (!admin) {
      admin = await UserService.findById(userId)
      isUserCollection = true
    }

    if (!admin || !admin.password) {
      return NextResponse.json({ error: 'Admin not found or invalid admin data' }, { status: 404 })
    }

    // Verify current password
    const isCurrentPasswordValid = await AuthService.comparePassword(currentPassword, admin.password)
    if (!isCurrentPasswordValid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
    }

    // Hash new password
    const hashedNewPassword = await AuthService.hashPassword(newPassword)

    // Update password in appropriate collection
    let success: boolean
    if (isUserCollection) {
      success = await UserService.updateUser(userId, { 
        password: hashedNewPassword,
        updatedAt: new Date()
      })
    } else {
      success = await DatabaseService.update('admins', userId, {
        password: hashedNewPassword,
        updatedAt: new Date()
      })
    }

    if (!success) {
      return NextResponse.json({ error: 'Failed to update password' }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Password updated successfully'
    })
  } catch (error) {
    console.error('Error updating password:', error)
    return NextResponse.json({ error: 'Failed to update password' }, { status: 500 })
  }
})