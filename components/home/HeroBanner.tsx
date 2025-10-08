"use client"

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Banner {
  _id: string
  title: string
  subtitle: string
  imageUrl: string
  mobileImageUrl: string
  linkUrl: string
  linkText: string
  order: number
  isActive: boolean
}

interface HeroBannerProps {
  banners: Banner[]
}

export function HeroBanner({ banners }: HeroBannerProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const activeBanners = banners.filter(banner => banner.isActive)
  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)
  const SWIPE_THRESHOLD = 40

  useEffect(() => {
    if (activeBanners.length > 1) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % activeBanners.length)
      }, 5000) // Auto-slide every 5 seconds

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
      nextSlide()
    } else {
      prevSlide()
    }
  }

  if (activeBanners.length === 0) {
    return (
      <div className="relative h-[400px] md:h-[500px] bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Welcome to Happy Feet</h1>
          <p className="text-xl md:text-2xl mb-8">Discover Amazing Products</p>
          <Link href="/products">
            <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
              Shop Now
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const currentBanner = activeBanners[currentSlide]

  return (
    <div
      className="relative h-[400px] md:h-[500px] overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Banner Image */}
      <div className="relative w-full h-full">
        <img
          src={currentBanner.imageUrl}
          alt={currentBanner.title}
          className="hidden md:block w-full h-full object-cover"
        />
        <img
          src={currentBanner.mobileImageUrl || currentBanner.imageUrl}
          alt={currentBanner.title}
          className="md:hidden w-full h-full object-cover"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-30" />
        
        {/* Content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4 max-w-4xl">
            <h1 className="text-3xl md:text-6xl font-bold mb-4">
              {currentBanner.title}
            </h1>
            {currentBanner.subtitle && (
              <p className="text-lg md:text-2xl mb-8">
                {currentBanner.subtitle}
              </p>
            )}
            {currentBanner.linkUrl && (
              <Link href={currentBanner.linkUrl}>
                <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
                  {currentBanner.linkText}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {activeBanners.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="hidden md:flex absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="hidden md:flex absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {activeBanners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {activeBanners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}