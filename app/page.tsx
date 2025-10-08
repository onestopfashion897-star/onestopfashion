"use client"

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/ui/navbar'
import { TopHeader } from '@/components/ui/top-header'
import { Footer } from '@/components/ui/footer'
import { ProductCard } from '@/components/ui/product-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ModernHero } from '@/components/home/ModernHero'
import PreloaderWrapper from '@/components/ui/preloader-wrapper'

import { 
  Truck, 
  Shield,
  ArrowRight,
  Zap
} from 'lucide-react'
import Link from 'next/link'
import { useCart } from '@/contexts/CartContext'
import { useWishlist } from '@/contexts/WishlistContext'
import { useAuth } from '@/contexts/AuthContext'
import { Product } from '@/lib/types'

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch featured products
        const featuredResponse = await fetch('/api/products?featured=true&limit=8')
        if (featuredResponse.ok) {
          const featuredData = await featuredResponse.json()
          setFeaturedProducts(featuredData.data || [])
        }

        // Fetch trending products (latest products)
        const trendingResponse = await fetch('/api/products?limit=8&sortBy=createdAt&sortOrder=desc')
        if (trendingResponse.ok) {
          const trendingData = await trendingResponse.json()
          setTrendingProducts(trendingData.data || [])
        }


      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])


  return (
    <PreloaderWrapper showPreloader={loading}>
      <div className="min-h-screen bg-white">
        <TopHeader />
        <Navbar />
      {/* Modern Hero Section */}
         <ModernHero />

      {/* Featured Products */}
      <section className="pt-16 pb-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
              Featured Products
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Discover our handpicked collection of premium items
            </p>
          </div>
          
          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
               {featuredProducts.map((product) => (
                 <ProductCard
                   key={product._id?.toString()}
                   product={product}
                 />
               ))}
             </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No featured products available at the moment.</p>
            </div>
          )}
          
          <div className="text-center">
            <Button asChild className="bg-black hover:bg-gray-800 text-white px-8 rounded-full">
              <Link href="/products" className="inline-flex items-center gap-2">
                View All
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Trending Now Section */}
      <section className="pt-16 pb-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
              Trending Now
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Discover what's popular this season
            </p>
          </div>
          
          {trendingProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
              {trendingProducts.map((product) => (
                <ProductCard
                  key={product._id?.toString()}
                  product={product}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No trending products available at the moment.</p>
            </div>
          )}
          
          <div className="text-center">
            <Button asChild className="bg-black hover:bg-gray-800 text-white px-8 rounded-full">
              <Link href="/products" className="inline-flex items-center gap-2">
                View All
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
              What Our Customers Say
            </h2>
            <p className="text-gray-500">Trusted by thousands of happy customers</p>
          </div>
          
          <div className="relative">
            <div className="flex animate-scroll gap-6">
              {[
                { name: "Priya Sharma", text: "Amazing quality and fast delivery! The clothes fit perfectly and the fabric is excellent.", rating: 5 },
                { name: "Rahul Verma", text: "Best online shopping experience. Great collection and customer service is top-notch!", rating: 5 },
                { name: "Anita Desai", text: "Love the variety of products. The prices are reasonable and quality is superb.", rating: 5 },
                { name: "Vikram Singh", text: "Highly recommend! Fast shipping and the products look exactly like the pictures.", rating: 5 },
                { name: "Sneha Patel", text: "Excellent quality clothing at affordable prices. Will definitely shop again!", rating: 5 },
                { name: "Arjun Kumar", text: "Great experience from start to finish. The customer support team is very helpful.", rating: 5 },
                { name: "Priya Sharma", text: "Amazing quality and fast delivery! The clothes fit perfectly and the fabric is excellent.", rating: 5 },
                { name: "Rahul Verma", text: "Best online shopping experience. Great collection and customer service is top-notch!", rating: 5 },
              ].map((testimonial, index) => (
                <div key={index} className="flex-shrink-0 w-80 bg-black p-6 rounded-xl shadow-sm">
                  <div className="flex mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-300 mb-4 text-sm">"{testimonial.text}"</p>
                  <p className="font-semibold text-white">{testimonial.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-black rounded-full flex items-center justify-center">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Free Shipping</h3>
              <p className="text-gray-500 text-sm">On orders over ₹999</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-black rounded-full flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Fast Delivery</h3>
              <p className="text-gray-500 text-sm">Quick delivery to your door</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-black rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure Payment</h3>
              <p className="text-gray-500 text-sm">100% secure transactions</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
      </div>
    </PreloaderWrapper>
  )
}
