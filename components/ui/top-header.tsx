"use client"

import { useState } from 'react'
import { X, Truck, Gift, Phone } from 'lucide-react'

export function TopHeader() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) {
    return null
  }

  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-2">
          {/* Left side - Announcement */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Truck className="w-4 h-4" />
              <span className="hidden sm:inline">Free shipping on orders over ₹999</span>
              <span className="sm:hidden">Free shipping ₹999+</span>
            </div>

          </div>

          {/* Right side - Contact & Close */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2">
              <Phone className="w-4 h-4" />
              <span>Support: +91 98765 43210</span>
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="hover:bg-white hover:bg-opacity-20 p-1 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}