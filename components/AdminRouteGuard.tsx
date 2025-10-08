"use client"

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAdminAuth } from '@/contexts/AdminAuthContext'

interface AdminRouteGuardProps {
  children: React.ReactNode
}

export default function AdminRouteGuard({ children }: AdminRouteGuardProps) {
  const { admin, loading, isAuthenticated } = useAdminAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Don't redirect while loading
    if (loading) return

    // Allow access to admin login page
    if (pathname === '/admin/login') return

    // If not authenticated, redirect to admin login page
    if (!isAuthenticated) {
      router.push('/admin/login')
      return
    }

    // If authenticated but not an admin, redirect to homepage
    if (isAuthenticated && admin && admin.role !== 'admin' && admin.role !== 'super_admin') {
      router.push('/')
      return
    }
  }, [loading, isAuthenticated, admin, pathname, router])

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying access...</p>
        </div>
      </div>
    )
  }

  // Don't render content if not authenticated or not admin (will redirect)
  if (!isAuthenticated && pathname !== '/admin/login') {
    return null
  }

  // Don't render if authenticated but not an admin
  if (isAuthenticated && admin && admin.role !== 'admin' && admin.role !== 'super_admin') {
    return null
  }

  return <>{children}</>
}