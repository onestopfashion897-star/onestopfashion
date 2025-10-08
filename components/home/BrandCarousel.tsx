"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Brand {
  _id: string
  name: string
  slug: string
  logoUrl?: string
  website?: string
  isActive: boolean
}

interface BrandCarouselProps {
  brands?: Brand[] // Made optional since we'll use hardcoded Happy Feet brand
}

export function BrandCarousel({ brands }: BrandCarouselProps) {
  const [isMobile, setIsMobile] = useState(false)
  
  // Hardcoded Happy Feet brand
  const happyFeetBrand: Brand = {
    _id: 'happy-feet-brand',
    name: 'Happy Feet',
    slug: 'happy-feet',
    logoUrl: '/logo/happy-logo.png',
    website: '',
    isActive: true
  }
  
  const activeBrands = [happyFeetBrand] // Only show Happy Feet brand
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  if (activeBrands.length === 0) {
    return null
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-12 md:p-16 text-center">
          <div className="flex justify-center mb-6">
            <img src="/logo/happy-logo.png" alt="Happy Feet" className="h-16 md:h-20 object-contain" />
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Happy Feet
          </h2>
          <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto">
            Your trusted brand for premium quality footwear, comfort and style
          </p>
        </div>
      </div>
    </section>
  )
}