"use client"

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAdminAuth } from '@/contexts/AdminAuthContext'

interface AdminAccessGuardProps {
  children: React.ReactNode
}

export default function AdminAccessGuard({ children }: AdminAccessGuardProps) {
  const { admin, loading: adminLoading, isAuthenticated: isAdminAuthenticated } = useAdminAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Don't redirect while loading
    if (adminLoading) return

    // Handle /admin-access page - allow anyone to access login page
    if (pathname === '/admin-access') {
      // If already logged in as admin, redirect to admin dashboard
      if (isAdminAuthenticated && admin && (admin.role === 'admin' || admin.role === 'super_admin')) {
        router.push('/admin')
        return
      }
      // Allow access to login page for non-authenticated users
      return
    }

    // Handle all other /admin/* pages
    if (pathname.startsWith('/admin')) {
      // If not authenticated as admin, redirect to homepage
      if (!isAdminAuthenticated || !admin) {
        router.push('/')
        return
      }

      // If authenticated but not as admin role, redirect to homepage
      if (admin.role !== 'admin' && admin.role !== 'super_admin') {
        router.push('/')
        return
      }
    }
  }, [adminLoading, isAdminAuthenticated, admin, pathname, router])

  // Show loading while checking authentication
  if (adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying access...</p>
        </div>
      </div>
    )
  }

  // For /admin-access page
  if (pathname === '/admin-access') {
    // Don't render if already authenticated as admin (will redirect)
    if (isAdminAuthenticated && admin && (admin.role === 'admin' || admin.role === 'super_admin')) {
      return null
    }
    
    // Render login page for non-authenticated users
    return <>{children}</>
  }

  // For all other /admin/* pages
  if (pathname.startsWith('/admin')) {
    // Don't render if not authenticated as admin (will redirect)
    if (!isAdminAuthenticated || !admin) {
      return null
    }

    // Don't render if authenticated but not as admin role (will redirect)
    if (admin.role !== 'admin' && admin.role !== 'super_admin') {
      return null
    }

    // Render admin content for valid admins
    return <>{children}</>
  }

  // For non-admin routes, just render children
  return <>{children}</>
}