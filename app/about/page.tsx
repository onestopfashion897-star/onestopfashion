"use client"

import { Navbar } from '@/components/ui/navbar'
import { Footer } from '@/components/ui/footer'
import { Heart, Award, Target } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            About Us
          </h1>
          <p className="text-lg text-gray-600">
            Fashion for everyone - Men, Women, and Kids.
          </p>
        </div>
      </div>

      {/* Our Story Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
          <p className="text-gray-600 mb-4">
            Founded with a simple mission - to make quality clothing accessible to everyone. 
            HappyFeet started as a small family business with a big dream: to provide stylish, 
            comfortable apparel for Men, Women, and Kids.
          </p>
          <p className="text-gray-600">
            Over the years, we've grown from a local store to a trusted online destination, 
            but our core values remain the same - quality, style, and customer satisfaction.
          </p>
        </div>
      </div>

      {/* Values Section */}
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Quality</h3>
              <p className="text-gray-600 text-sm">Premium materials and craftsmanship</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Customer First</h3>
              <p className="text-gray-600 text-sm">Your satisfaction is our priority</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Innovation</h3>
              <p className="text-gray-600 text-sm">Latest designs and technology</p>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}