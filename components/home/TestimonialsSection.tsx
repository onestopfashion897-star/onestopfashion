"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react'

interface Testimonial {
  _id: string
  customerName: string
  customerImage?: string
  customerLocation?: string
  rating: number
  comment: string
  productName?: string
  productImage?: string
  featured: boolean
  isActive: boolean
}

interface TestimonialsSectionProps {
  testimonials: Testimonial[]
}

export function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  
  const activeTestimonials = testimonials
    .filter(testimonial => testimonial.isActive)
    .sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))

  useEffect(() => {
    if (activeTestimonials.length > 1) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % activeTestimonials.length)
      }, 5000) // Auto-slide every 5 seconds

      return () => clearInterval(timer)
    }
  }, [activeTestimonials.length])

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % activeTestimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + activeTestimonials.length) % activeTestimonials.length)
  }

  if (activeTestimonials.length === 0) {
    return null
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`w-5 h-5 ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What Our Customers Say
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Don't just take our word for it - hear from our satisfied customers
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {activeTestimonials.map((testimonial) => (
                <div key={testimonial._id} className="w-full flex-shrink-0 px-4">
                  <Card className="bg-white shadow-lg">
                    <CardContent className="p-8 text-center">
                      <Quote className="w-12 h-12 text-purple-500 mx-auto mb-6" />
                      
                      <div className="flex justify-center mb-4">
                        {renderStars(testimonial.rating)}
                      </div>

                      <blockquote className="text-lg text-gray-700 mb-6 italic leading-relaxed">
                        "{testimonial.comment}"
                      </blockquote>

                      <div className="flex items-center justify-center space-x-4">
                        {testimonial.customerImage ? (
                          <img
                            src={testimonial.customerImage}
                            alt={testimonial.customerName}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold">
                              {testimonial.customerName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        
                        <div className="text-left">
                          <div className="font-semibold text-gray-900">
                            {testimonial.customerName}
                          </div>
                          {testimonial.customerLocation && (
                            <div className="text-sm text-gray-600">
                              {testimonial.customerLocation}
                            </div>
                          )}
                          {testimonial.productName && (
                            <div className="text-sm text-purple-600">
                              Purchased: {testimonial.productName}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          {activeTestimonials.length > 1 && (
            <>
              <button
                onClick={prevTestimonial}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-all"
              >
                <ChevronLeft className="w-6 h-6 text-gray-600" />
              </button>
              <button
                onClick={nextTestimonial}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-all"
              >
                <ChevronRight className="w-6 h-6 text-gray-600" />
              </button>
            </>
          )}

          {/* Dots Indicator */}
          {activeTestimonials.length > 1 && (
            <div className="flex justify-center mt-8 space-x-2">
              {activeTestimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentIndex ? 'bg-purple-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}