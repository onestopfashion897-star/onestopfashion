"use client"

import { Navbar } from '@/components/ui/navbar'
import { Footer } from '@/components/ui/footer'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Heart, 
  Users, 
  Award, 
  Target, 
  Truck, 
  Shield, 
  Star,
  MapPin,
  Phone,
  Mail
} from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />
      
      {/* Hero Section */}
      <div className="pt-20 lg:pt-32 pb-12 lg:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-20">
            <Badge className="mb-4 lg:mb-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 lg:px-6 py-2 lg:py-3 text-sm lg:text-base font-semibold">
              About HappyFeet - tech  Collection
            </Badge>
            <h1 className="text-3xl lg:text-6xl font-bold text-gray-900 mb-4 lg:mb-8 leading-tight">
              Your Comfort, Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Passion</span>
            </h1>
            <p className="text-lg lg:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              At HappyFeet, we believe that every step should be comfortable, stylish, and confident. 
              We're dedicated to bringing you the finest footwear that combines quality, comfort, and fashion.
            </p>
          </div>
        </div>
      </div>

      {/* Our Story Section */}
      <div className="py-12 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div>
              <h2 className="text-2xl lg:text-4xl font-bold text-gray-900 mb-6 lg:mb-8">
                Our Story
              </h2>
              <p className="text-gray-600 text-base lg:text-lg leading-relaxed mb-6">
                Founded with a simple mission - to make quality footwear accessible to everyone. 
                HappyFeet, operated by <strong>tech  Collection</strong>, started as a small family business with a big dream: to create shoes 
                that don't just look good, but feel amazing too.
              </p>
              <p className="text-gray-600 text-base lg:text-lg leading-relaxed mb-6">
                Over the years, we've grown from a local store to a trusted online destination, 
                but our core values remain the same - quality, comfort, and customer satisfaction. 
                tech  Collection continues to uphold these principles in every aspect of our business.
              </p>
              <div className="flex flex-wrap gap-4">
                <Badge variant="outline" className="px-4 py-2 text-blue-700 border-blue-200">
                  <Award className="w-4 h-4 mr-2" />
                  Quality First
                </Badge>
                <Badge variant="outline" className="px-4 py-2 text-green-700 border-green-200">
                  <Heart className="w-4 h-4 mr-2" />
                  Customer Love
                </Badge>
                <Badge variant="outline" className="px-4 py-2 text-purple-700 border-purple-200">
                  <Target className="w-4 h-4 mr-2" />
                  Innovation
                </Badge>
              </div>
            </div>
            <div className="relative">
              <Card className="bg-gradient-to-br from-blue-100 to-purple-100 border-0 shadow-2xl">
                <CardContent className="p-8 lg:p-12">
                  <div className="text-center">
                    <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Users className="w-10 h-10 lg:w-12 lg:h-12 text-white" />
                    </div>
                    <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4">
                      50,000+ Happy Customers
                    </h3>
                    <p className="text-gray-600 text-sm lg:text-base">
                      Join thousands of satisfied customers who trust HappyFeet for their footwear needs.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="py-12 lg:py-20 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-2xl lg:text-4xl font-bold text-gray-900 mb-4 lg:mb-6">
              What We Stand For
            </h2>
            <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
              Our values guide everything we do, from product selection to customer service.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-cyan-50">
              <CardContent className="p-6 lg:p-8 text-center">
                <div className="w-16 h-16 lg:w-20 lg:h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 lg:mb-6">
                  <Award className="w-8 h-8 lg:w-10 lg:h-10 text-blue-600" />
                </div>
                <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-3 lg:mb-4">Premium Quality</h3>
                <p className="text-gray-600 text-sm lg:text-base">
                  We source only the finest materials and work with trusted manufacturers to ensure every pair meets our high standards.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 to-emerald-50">
              <CardContent className="p-6 lg:p-8 text-center">
                <div className="w-16 h-16 lg:w-20 lg:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 lg:mb-6">
                  <Heart className="w-8 h-8 lg:w-10 lg:h-10 text-green-600" />
                </div>
                <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-3 lg:mb-4">Customer First</h3>
                <p className="text-gray-600 text-sm lg:text-base">
                  Your satisfaction is our priority. We're here to help you find the perfect fit and provide exceptional service.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardContent className="p-6 lg:p-8 text-center">
                <div className="w-16 h-16 lg:w-20 lg:h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 lg:mb-6">
                  <Target className="w-8 h-8 lg:w-10 lg:h-10 text-purple-600" />
                </div>
                <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-3 lg:mb-4">Innovation</h3>
                <p className="text-gray-600 text-sm lg:text-base">
                  We continuously seek new technologies and designs to bring you the most comfortable and stylish footwear.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-2xl lg:text-4xl font-bold text-gray-900 mb-4 lg:mb-6">
              Why Choose HappyFeet?
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            <div className="text-center">
              <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 lg:mb-6">
                <Truck className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
              </div>
              <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-2 lg:mb-3">Fast Delivery</h3>
              <p className="text-gray-600 text-sm lg:text-base">Quick and reliable shipping to your doorstep</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 lg:mb-6">
                <Shield className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
              </div>
              <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-2 lg:mb-3">Secure Shopping</h3>
              <p className="text-gray-600 text-sm lg:text-base">Safe and secure payment processing</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 lg:mb-6">
                <Star className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
              </div>
              <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-2 lg:mb-3">Top Rated</h3>
              <p className="text-gray-600 text-sm lg:text-base">Highly rated by thousands of customers</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4 lg:mb-6">
                <Heart className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
              </div>
              <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-2 lg:mb-3">24/7 Support</h3>
              <p className="text-gray-600 text-sm lg:text-base">Always here to help with your questions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="py-12 lg:py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl lg:text-4xl font-bold text-white mb-4 lg:mb-6">
              Get In Touch
            </h2>
            <p className="text-lg lg:text-xl text-blue-100 mb-8 lg:mb-12 max-w-3xl mx-auto">
              Have questions? We'd love to hear from you at tech  Collection. Send us a message and we'll respond as soon as possible.
            </p>
            

          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}