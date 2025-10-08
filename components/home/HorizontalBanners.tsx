"use client"

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface HorizontalBanner {
  _id: string
  imageUrl: string
  linkUrl?: string
  index: number
  isActive: boolean
}

interface HorizontalBannersProps {
  banners?: HorizontalBanner[]
}

export function HorizontalBanners({ banners = [] }: HorizontalBannersProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [activeBanners, setActiveBanners] = useState<HorizontalBanner[]>([])
  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)
  const SWIPE_THRESHOLD = 40

  useEffect(() => {
    // Filter and sort active banners
    const filtered = banners
      .filter(banner => banner.isActive)
      .sort((a, b) => a.index - b.index)
    setActiveBanners(filtered)
  }, [banners])

  useEffect(() => {
    if (activeBanners.length > 1) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % activeBanners.length)
      }, 4000) // Auto-slide every 4 seconds

      return () => clearInterval(timer)
    }
  }, [activeBanners.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % activeBanners.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + activeBanners.length) % activeBanners.length)
  }

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchEndX.current = null
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return
    const deltaX = touchStartX.current - touchEndX.current
    if (Math.abs(deltaX) < SWIPE_THRESHOLD) return
    if (deltaX > 0) {
      // swipe left -> next
      nextSlide()
    } else {
      // swipe right -> previous
      prevSlide()
    }
  }

  if (activeBanners.length === 0) {
    return (
      <div className="relative h-[250px] md:h-[500px] bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Welcome to Happy Feet</h1>
          <p className="text-xl md:text-2xl mb-8">Discover Amazing Products</p>
          <Link href="/products">
            <button className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold text-lg transition-colors">
              Shop Now
            </button>
          </Link>
        </div>
      </div>
    )
  }

  const currentBanner = activeBanners[currentSlide]

  return (
    <div
      className="relative h-[250px] md:h-[500px] overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Banner Image */}
      <div className="relative w-full h-full">
        {currentBanner.linkUrl ? (
          <Link href={currentBanner.linkUrl} className="block w-full h-full">
            <img
              src={currentBanner.imageUrl}
              alt={`Banner ${currentSlide + 1}`}
              className="w-full h-full object-cover transition-all duration-500"
            />
          </Link>
        ) : (
          <img
            src={currentBanner.imageUrl}
            alt={`Banner ${currentSlide + 1}`}
            className="w-full h-full object-cover transition-all duration-500"
          />
        )}
        
        {/* Subtle overlay for better contrast */}
        <div className="absolute inset-0 bg-black bg-opacity-10" />
      </div>

      {/* Navigation Arrows */}
      {activeBanners.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="hidden md:flex absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-3 rounded-full transition-all duration-200 backdrop-blur-sm"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="hidden md:flex absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-3 rounded-full transition-all duration-200 backdrop-blur-sm"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {activeBanners.length > 1 && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
          {activeBanners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentSlide 
                  ? 'bg-white scale-110' 
                  : 'bg-white bg-opacity-50 hover:bg-opacity-75'
              }`}
            />
          ))}
        </div>
      )}


    </div>
  )
}