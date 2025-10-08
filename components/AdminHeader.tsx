"use client"

import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAdminAuth } from "@/contexts/AdminAuthContext"

interface AdminHeaderProps {
  onMenuClick?: () => void
}

export default function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const { admin } = useAdminAuth()

  return (
    <header className="bg-white shadow-sm border-b h-16 flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
        <Menu className="w-5 h-5" />
      </Button>

      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-600">Welcome back, {admin?.name || 'Admin'}</span>
        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
          <span className="text-white font-medium text-sm">{admin?.name?.charAt(0) || 'A'}</span>
        </div>
      </div>
    </header>
  )
}