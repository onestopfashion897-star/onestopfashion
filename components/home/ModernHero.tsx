"use client"

import { useState, useEffect } from 'react'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface Banner {
  _id: string
  imageUrl: string
  linkUrl?: string
  index: number
  isActive: boolean
}

export function ModernHero() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [banners, setBanners] = useState<Banner[]>([])

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch('/api/horizontal-banners')
        const data = await response.json()
        if (data.success && data.data) {
          const activeBanners = data.data.filter((b: Banner) => b.isActive)
          setBanners(activeBanners)
        }
      } catch (error) {
        console.error('Error fetching banners:', error)
      }
    }
    fetchBanners()
  }, [])

  const slides = banners.length > 0 ? banners : [
    {
      _id: '1',
      imageUrl: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400&h=600&fit=crop',
      index: 1,
      isActive: true
    },
    {
      _id: '2',
      imageUrl: 'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=400&h=600&fit=crop',
      index: 2,
      isActive: true
    },
    {
      _id: '3',
      imageUrl: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=600&fit=crop',
      index: 3,
      isActive: true
    },
    {
      _id: '4',
      imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=600&fit=crop',
      index: 4,
      isActive: true
    },
    {
      _id: '5',
      imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=600&fit=crop',
      index: 5,
      isActive: true
    }
  ]

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  if (slides.length === 0) {
    return null
  }

  return (
    <section className="relative bg-[#1a1a1a] text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 border border-white/20 rotate-45 -translate-x-48 -translate-y-48" />
        <div className="absolute bottom-0 right-0 w-96 h-96 border border-white/20 rotate-45 translate-x-48 translate-y-48" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16">
        {/* Badge */}
        <div className="text-center mb-4">
          <span className="inline-block px-5 py-1.5 border border-white/30 rounded-full text-xs text-gray-300">
            New spring collection 2023
          </span>
        </div>

        {/* Main Heading */}
        <div className="text-center mb-4 max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-3">
            Where style speaks, trends resonate,
            <br />
            fashion flourishes
          </h1>
          <p className="text-gray-400 text-sm md:text-base max-w-2xl mx-auto">
            Unveiling a fashion destination where trends blend seamlessly with your
            individual style aspirations. Discover today!
          </p>
        </div>

        {/* CTA Button */}
        <div className="text-center mb-8">
          <Button 
            asChild
            className="bg-white text-black hover:bg-gray-100 rounded-full px-6 py-5 text-sm font-medium"
          >
            <Link href="/products" className="inline-flex items-center gap-2">
              New collection
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        {/* Image Carousel */}
        <div className="relative max-w-5xl mx-auto">
          <div className="relative h-[320px] flex items-center justify-center overflow-hidden">
            {/* Navigation Button - Left */}
            <button
              onClick={prevSlide}
              className="absolute left-2 z-20 w-10 h-10 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-full flex items-center justify-center transition-all"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Images Container */}
            <div className="relative w-full h-full flex items-center justify-center">
              {slides.map((slide, index) => {
                const totalSlides = slides.length
                let position = (index - currentSlide + totalSlides) % totalSlides
                
                // Adjust position for circular display
                if (position > Math.floor(totalSlides / 2)) {
                  position = position - totalSlides
                }
                
                const isCenter = position === 0
                const offset = position * 220 // spacing between slides (reduced)
                
                return (
                  <div
                    key={slide._id}
                    className={`absolute transition-all duration-500 ease-out ${
                      Math.abs(position) > 2
                        ? 'opacity-0 pointer-events-none'
                        : Math.abs(position) === 2
                        ? 'opacity-30 scale-75'
                        : Math.abs(position) === 1
                        ? 'opacity-60 scale-85'
                        : 'opacity-100 scale-100 z-10'
                    }`}
                    style={{
                      transform: `translateX(${offset}px)`,
                      left: '50%',
                      marginLeft: '-96px' // half of w-48
                    }}
                  >
                    <div 
                      className="relative w-48 h-60 rounded-[2rem] overflow-hidden cursor-pointer shadow-2xl"
                      onClick={() => slide.linkUrl && (window.location.href = slide.linkUrl)}
                    >
                      <img
                        src={slide.imageUrl}
                        alt={`Banner ${slide.index}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Navigation Button - Right */}
            <button
              onClick={nextSlide}
              className="absolute right-2 z-20 w-10 h-10 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-full flex items-center justify-center transition-all"
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
