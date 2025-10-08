"use client"

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/ui/navbar'
import { TopHeader } from '@/components/ui/top-header'
import { Footer } from '@/components/ui/footer'
import { ProductCard } from '@/components/ui/product-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ModernHero } from '@/components/home/ModernHero'
import { HorizontalBanners } from '@/components/home/HorizontalBanners'
import { CategoriesShowcase } from '@/components/home/CategoriesShowcase'
import { BrandCarousel } from '@/components/home/BrandCarousel'
import { DealsSection } from '@/components/home/DealsSection'
import { TestimonialsSection } from '@/components/home/TestimonialsSection'
import PreloaderWrapper from '@/components/ui/preloader-wrapper'

import { 
  Truck, 
  Shield, 
  Star,
  ArrowRight,
  TrendingUp
} from 'lucide-react'
import Link from 'next/link'
import { useCart } from '@/contexts/CartContext'
import { useWishlist } from '@/contexts/WishlistContext'
import { useAuth } from '@/contexts/AuthContext'
import { Product } from '@/lib/types'

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [brands, setBrands] = useState<any[]>([])
  const [horizontalBanners, setHorizontalBanners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { addItem } = useCart()
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist()
  const { user } = useAuth()

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

        // Fetch all products for the "All Products" section
        const allProductsResponse = await fetch('/api/products?limit=8')
        if (allProductsResponse.ok) {
          const allProductsData = await allProductsResponse.json()
          setAllProducts(allProductsData.data || [])
        }

        // Fetch categories
        const categoriesResponse = await fetch('/api/categories?limit=8&isActive=true')
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json()
          setCategories(categoriesData.data || [])
        }

        // Fetch brands
        const brandsResponse = await fetch('/api/brands?limit=10&isActive=true')
        if (brandsResponse.ok) {
          const brandsData = await brandsResponse.json()
          setBrands(brandsData.data || [])
        }

        // Fetch horizontal banners
        const horizontalBannersResponse = await fetch('/api/horizontal-banners')
        if (horizontalBannersResponse.ok) {
          const horizontalBannersData = await horizontalBannersResponse.json()
          setHorizontalBanners(horizontalBannersData.data || [])
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleAddToCart = (product: Product) => {
    if (product.sizes.length > 0) {
      // If product has sizes, redirect to product page for size selection
      window.location.href = `/products/${product._id?.toString()}`
    } else {
      addItem({
        productId: product._id?.toString() || '',
        name: product.name,
        price: product.price,
        offerPrice: product.offerPrice,
        image: product.images[0],
        quantity: 1,
        size: '',
        stock: product.stock
      })
    }
  }

  const handleWishlistToggle = (product: Product) => {
    const productId = product._id?.toString() || ''
    if (isInWishlist(productId)) {
      removeFromWishlist(productId)
    } else {
      addToWishlist(productId)
    }
  }



  return (
    <PreloaderWrapper showPreloader={loading}>
      <div className="min-h-screen bg-white">
        <TopHeader />
        <Navbar />
      {/* Modern Hero Section */}
         <ModernHero />

      {/* Featured Products */}
      <section className="pt-8 md:pt-12 pb-16 md:pb-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-yellow-50 text-yellow-600 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Star className="w-4 h-4" />
              FEATURED PRODUCTS
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Most Selling Items
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Handpicked premium selections that define quality and style
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
            <Button asChild size="lg" className="bg-black hover:bg-gray-800 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300">
              <Link href="/products">
                View All Products
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Shop by Category Section */}
      <section className="pt-6 md:pt-10 pb-16 md:pb-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
         
          <CategoriesShowcase categories={categories} />
        </div>
      </section>

      {/* Trending Now Section */}
      <section className="pt-8 md:pt-12 pb-16 md:pb-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <TrendingUp className="w-4 h-4" />
              TRENDING NOW
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What's Hot Right Now
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover the most popular products that everyone's talking about
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
            <Button asChild size="lg" className="bg-black hover:bg-gray-800 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300">
              <Link href="/products">
                View All Products
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Brand Carousel */}
         <BrandCarousel brands={brands} />

         {/* Deals Section */}
         <DealsSection deals={[]} />

      {/* Testimonials */}
      <TestimonialsSection testimonials={[]} />



      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="text-center group">
              <div className="w-12 h-12 mx-auto mb-4 bg-black rounded-lg flex items-center justify-center group-hover:bg-gray-800 transition-colors duration-300">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Free Shipping</h3>
              <p className="text-gray-600 text-sm">Free shipping on all orders over ₹999</p>
            </div>
            <div className="text-center group">
              <div className="w-12 h-12 mx-auto mb-4 bg-black rounded-lg flex items-center justify-center group-hover:bg-gray-800 transition-colors duration-300">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure Payment</h3>
              <p className="text-gray-600 text-sm">Your payment information is safe with us</p>
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
