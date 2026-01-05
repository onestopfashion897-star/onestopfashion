"use client"

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Navbar } from '@/components/ui/navbar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Star, 
  Heart, 
  ShoppingCart, 
  Truck, 
  Shield, 
  ArrowLeft, 
  Minus, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Package, 
  Clock, 
  Users, 
  Share2, 
  Eye, 
  Zap, 
  Award,
  Check,
  Tag,
  Info,
  Star as StarIcon,
  Ruler
} from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { useWishlist } from '@/contexts/WishlistContext'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { Product, Review } from '@/lib/types'

export default function ProductDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { addItem } = useCart()
  const { addItem: addToWishlist, isInWishlist, removeItem: removeFromWishlist } = useWishlist()
  const { user } = useAuth()

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [selectedVariant, setSelectedVariant] = useState<string>('')
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [allImages, setAllImages] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState('overview')
  const [imageLoading, setImageLoading] = useState(true)
  const [reviews, setReviews] = useState<Review[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [reviewStats, setReviewStats] = useState<{
    averageRating: number
    totalReviews: number
    ratingDistribution: { [key: number]: number }
  } | null>(null)
  const hasFetchedRef = useRef(false)

  // Fetch product, reviews and stats once per mount (avoid React Strict Mode double fetch)
  useEffect(() => {
    if (!params.id) return
    if (hasFetchedRef.current) return
    hasFetchedRef.current = true
    fetchProduct()
    fetchReviews()
    fetchReviewStats()
  }, [params.id])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/products/${params.id}`)
      const data = await response.json()

      if (data.success) {
        setProduct(data.data)
        const images = [...data.data.images, ...(data.data.galleryImages || [])]
        setAllImages(images)
        if (data.data.categoryId) {
          fetchRelatedProducts(data.data.categoryId)
        }
      } else {
        toast({
          title: "Product Not Found",
          description: "The product you're looking for doesn't exist.",
          variant: "destructive"
        })
        router.push('/products')
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      toast({
        title: "Error",
        description: "Failed to load product details",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchReviews = async () => {
    try {
      setReviewsLoading(true)
      const response = await fetch(`/api/reviews?productId=${params.id}&status=approved`)
      if (response.ok) {
        const data = await response.json()
        setReviews(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setReviewsLoading(false)
    }
  }

  const fetchReviewStats = async () => {
    try {
      const response = await fetch(`/api/reviews/stats?productId=${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setReviewStats(
          (data && data.data) ? data.data : {
            averageRating: 0,
            totalReviews: 0,
            ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
          }
        )
      }
    } catch (error) {
      console.error('Error fetching review stats:', error)
    }
  }

  const fetchRelatedProducts = async (categoryId: string) => {
    try {
      const response = await fetch(`/api/products?category=${categoryId}&limit=4`, {
        cache: 'force-cache',
        next: { revalidate: 300 }
      })
      const data = await response.json()
      if (data.success) {
        setRelatedProducts(data.data.filter((p: Product) => p._id?.toString() !== params.id).slice(0, 4))
      }
    } catch (error) {
      console.error('Error fetching related products:', error)
    }
  }

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size)
  }

  const handleVariantSelect = (variantId: string) => {
    setSelectedVariant(variantId)
    setSelectedImage(0) // Reset to first image when variant changes
    
    if (product?.variants) {
      const variant = product.variants.find(v => v.id === variantId)
      if (variant && variant.images.length > 0) {
        // Update allImages to show variant-specific images
        const variantImages = [...variant.images, ...product.images]
        setAllImages(variantImages)
      } else {
        // Fallback to product images if variant has no images
        const images = [...product.images, ...(product.galleryImages || [])]
        setAllImages(images)
      }
    }
  }

  const getCurrentPrice = () => {
    if (!product) return 0
    
    if (selectedVariant && product.variants) {
      const variant = product.variants.find(v => v.id === selectedVariant)
      if (variant?.price !== undefined) {
        return variant.price
      }
    }
    
    return product.price
  }

  const getCurrentOfferPrice = () => {
    if (!product) return undefined
    
    if (selectedVariant && product.variants) {
      const variant = product.variants.find(v => v.id === selectedVariant)
      if (variant?.offerPrice !== undefined) {
        return variant.offerPrice
      }
    }
    
    return product.offerPrice
  }

  const getCurrentStock = () => {
    if (!product) return 0
    
    if (selectedVariant && product.variants) {
      const variant = product.variants.find(v => v.id === selectedVariant)
      if (variant) {
        return variant.stock
      }
    }
    
    return product.stock
  }

  const getSelectedVariant = () => {
    if (!product?.variants || !selectedVariant) return null
    return product.variants.find(v => v.id === selectedVariant) || null
  }

  const handleQuantityChange = (newQuantity: number) => {
    const maxStock = getCurrentStock()
    if (newQuantity >= 1 && newQuantity <= maxStock) {
      setQuantity(newQuantity)
    }
  }

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast({
        title: "Select Size",
        description: "Please select a size before adding to cart",
        variant: "destructive"
      })
      return
    }

    if (product?.hasVariants && !selectedVariant) {
      toast({
        title: "Select Variant",
        description: "Please select a color/model before adding to cart",
        variant: "destructive"
      })
      return
    }

    if (!product) return

    const selectedVariantData = getSelectedVariant()
    const currentPrice = getCurrentPrice()
    const currentOfferPrice = getCurrentOfferPrice()
    const currentStock = getCurrentStock()

    addItem({
      productId: product._id!.toString(),
      name: product.name,
      price: currentPrice,
      offerPrice: currentOfferPrice,
      quantity,
      size: selectedSize,
      image: allImages[0] || product.images[0],
      stock: currentStock,
      variantId: selectedVariantData?.id,
      variantName: selectedVariantData?.name,
      variantType: selectedVariantData?.type
    })

    const variantText = selectedVariantData ? ` (${selectedVariantData.name})` : ''
    toast({
      title: "Added to Cart",
      description: `${product.name}${variantText} has been added to your cart`,
    })
  }

  const handleWishlistToggle = () => {
    if (!product) return

    const productId = product._id!.toString()
    if (isInWishlist(productId)) {
      removeFromWishlist(productId)
      toast({
        title: "Removed from Wishlist",
        description: `${product.name} has been removed from your wishlist`,
      })
    } else {
      addToWishlist(productId)
      toast({
        title: "Added to Wishlist",
        description: `${product.name} has been added to your wishlist`,
      })
    }
  }

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % allImages.length)
  }

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + allImages.length) % allImages.length)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name,
        text: product?.description,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Link Copied",
        description: "Product link copied to clipboard",
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20">
          <div className="animate-pulse">
            <div className="grid lg:grid-cols-2 gap-16">
              <div className="space-y-8">
                <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 rounded-3xl"></div>
                <div className="grid grid-cols-5 gap-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl"></div>
                  ))}
                </div>
              </div>
              <div className="space-y-8">
                <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl w-3/4"></div>
                <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-1/2"></div>
                <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/3"></div>
                <div className="space-y-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20">
          <div className="text-center">
            <div className="w-32 h-32 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-8">
              <Package className="w-16 h-16 text-gray-400" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-6">Product Not Found</h1>
            <p className="text-gray-600 mb-10 max-w-lg mx-auto text-lg">The product you're looking for doesn't exist or may have been removed.</p>
            <Link href="/products">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 text-lg font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300">
                Browse Products
                <ArrowLeft className="ml-3 w-6 h-6" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const discount = product.offerPrice ? Math.round(((product.price - product.offerPrice) / product.price) * 100) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-x-hidden">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20 container-constrained">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-3 text-sm text-gray-600 mb-12 overflow-x-auto">
          <Link href="/" className="hover:text-blue-600 transition-colors font-medium whitespace-nowrap">Home</Link>
          <span className="text-gray-400">/</span>
          <Link href="/products" className="hover:text-blue-600 transition-colors font-medium whitespace-nowrap">Products</Link>
          <span className="text-gray-400">/</span>
          <Link href={`/products?category=${product.category?.name || 'all'}`} className="hover:text-blue-600 transition-colors font-medium capitalize whitespace-nowrap">
            {product.category?.name || 'All'}
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 font-semibold truncate max-w-xs">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 container-constrained">
          {/* Product Images */}
          <div className="space-y-4 lg:space-y-8">
            <div className="relative aspect-square bg-white rounded-2xl lg:rounded-3xl overflow-hidden shadow-xl lg:shadow-2xl border border-gray-100 max-w-full">
              {imageLoading && (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse flex items-center justify-center">
                  <div className="w-8 h-8 lg:w-12 lg:h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              <Image
                src={allImages[selectedImage] || '/placeholder.jpg'}
                alt={product.name}
                fill
                className={`object-cover transition-all duration-500 ${imageLoading ? 'opacity-0 scale-105' : 'opacity-100 scale-100'}`}
                onLoad={() => setImageLoading(false)}
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-3 lg:left-6 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full p-2 lg:p-4 shadow-lg lg:shadow-xl transition-all hover:scale-110 border border-gray-200 z-10"
                  >
                    <ChevronLeft className="w-4 h-4 lg:w-6 lg:h-6 text-gray-700" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-3 lg:right-6 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full p-2 lg:p-4 shadow-lg lg:shadow-xl transition-all hover:scale-110 border border-gray-200 z-10"
                  >
                    <ChevronRight className="w-4 h-4 lg:w-6 lg:h-6 text-gray-700" />
                  </button>
                </>
              )}
              {discount > 0 && (
                <Badge className="absolute top-3 lg:top-6 left-3 lg:left-6 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs lg:text-sm font-bold shadow-lg lg:shadow-xl px-2 lg:px-4 py-1 lg:py-2 rounded-full z-10">
                  {discount}% OFF
                </Badge>
              )}
              <div className="absolute top-3 lg:top-6 right-3 lg:right-6 flex gap-2 lg:gap-3 z-10">
                <Button
                  size="icon"
                  variant="ghost"
                  className="bg-white/90 hover:bg-white backdrop-blur-sm rounded-full shadow-lg lg:shadow-xl border border-gray-200 transition-all hover:scale-110 w-8 h-8 lg:w-10 lg:h-10"
                  onClick={handleShare}
                >
                  <Share2 className="w-4 h-4 lg:w-5 lg:h-5 text-gray-700" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className={`rounded-full shadow-lg lg:shadow-xl border transition-all hover:scale-110 w-8 h-8 lg:w-10 lg:h-10 ${
                    isInWishlist(product._id!.toString()) 
                      ? 'bg-red-500 text-white border-red-500 hover:bg-red-600' 
                      : 'bg-white/90 hover:bg-white border-gray-200'
                  }`}
                  onClick={handleWishlistToggle}
                >
                  <Heart className={`w-4 h-4 lg:w-5 lg:h-5 ${isInWishlist(product._id!.toString()) ? 'fill-current' : ''}`} />
                </Button>
              </div>
            </div>
            {allImages.length > 1 && (
              <div className="grid grid-cols-5 gap-2 lg:gap-4 max-w-full">
                {allImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square bg-white rounded-xl lg:rounded-2xl overflow-hidden border-2 transition-all duration-300 hover:scale-105 relative ${
                      selectedImage === index 
                        ? 'border-blue-500 shadow-lg lg:shadow-xl ring-2 lg:ring-4 ring-blue-100' 
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 20vw, 10vw"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6 lg:space-y-10">
            <div>
              <div className="flex items-center gap-2 lg:gap-4 mb-4 lg:mb-6 flex-wrap">
                {product.brand && (
                  <Badge variant="outline" className="capitalize bg-white/80 backdrop-blur-sm border-blue-200 text-blue-700 font-semibold px-2 lg:px-4 py-1 lg:py-2 rounded-full text-xs lg:text-sm">
                    {product.brand.name}
                  </Badge>
                )}
                {product.category && (
                  <Badge variant="outline" className="capitalize bg-white/80 backdrop-blur-sm border-gray-200 text-gray-700 font-semibold px-2 lg:px-4 py-1 lg:py-2 rounded-full text-xs lg:text-sm">
                    {product.category.name}
                  </Badge>
                )}
                {product.featured && (
                  <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold px-2 lg:px-4 py-1 lg:py-2 rounded-full shadow-lg text-xs lg:text-sm">
                    <Award className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                    Featured
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl lg:text-5xl font-bold text-gray-900 mb-3 lg:mb-6 leading-tight">{product.name}</h1>
              <p className="text-gray-600 text-sm lg:text-xl leading-relaxed mb-4 lg:mb-8">{product.description}</p>
              
              {/* Price */}
              <div className="flex items-center gap-3 lg:gap-6 mb-4 lg:mb-8 flex-wrap">
                {getCurrentOfferPrice() ? (
                  <>
                    <span className="text-2xl lg:text-5xl font-bold text-gray-900">₹{getCurrentOfferPrice()!.toLocaleString()}</span>
                    <span className="text-lg lg:text-3xl text-gray-400 line-through">₹{getCurrentPrice().toLocaleString()}</span>
                    <Badge variant="destructive" className="text-xs lg:text-lg font-bold px-2 lg:px-4 py-1 lg:py-2 rounded-full shadow-lg">
                      Save ₹{(getCurrentPrice() - getCurrentOfferPrice()!).toLocaleString()}
                    </Badge>
                  </>
                ) : (
                  <span className="text-2xl lg:text-5xl font-bold text-gray-900">₹{getCurrentPrice().toLocaleString()}</span>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-3 lg:gap-6 mb-6 lg:mb-10 flex-wrap">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 lg:w-6 lg:h-6 ${
                        i < Math.floor((reviewStats?.averageRating ?? product.rating ?? 0)) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-gray-700 font-semibold text-sm lg:text-lg">({reviewStats?.totalReviews ?? product.reviewCount ?? 0} reviews)</span>
                <span className="text-gray-400 text-lg lg:text-2xl">•</span>
                <span className="text-gray-700 font-semibold text-sm lg:text-lg">SKU: {product.sku}</span>
              </div>
            </div>

            {/* Variant Selection */}
            {product.hasVariants && product.variants && product.variants.length > 0 && (
              <div>
                <h3 className="text-lg lg:text-2xl font-bold mb-3 lg:mb-6 text-gray-900">
                  Select {product.variants[0].type === 'color' ? 'Color' : 'Model'}
                </h3>
                <div className="grid grid-cols-3 gap-2 lg:gap-4">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => handleVariantSelect(variant.id)}
                      className={`p-3 lg:p-6 border-2 rounded-xl lg:rounded-2xl text-center font-bold text-sm lg:text-lg transition-all duration-300 hover:scale-105 relative overflow-hidden ${
                        selectedVariant === variant.id
                          ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-lg lg:shadow-xl ring-2 lg:ring-4 ring-blue-100'
                          : 'border-gray-200 hover:border-blue-300 bg-white hover:shadow-lg'
                      }`}
                    >
                      {variant.images && variant.images.length > 0 && (
                        <div className="w-full h-12 lg:h-16 mb-2 relative rounded-lg overflow-hidden">
                          <Image
                            src={variant.images[0]}
                            alt={variant.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 33vw, 20vw"
                          />
                        </div>
                      )}
                      <div className="text-xs lg:text-sm font-semibold">{variant.name}</div>
                      {variant.value && (
                        <div className="text-xs text-gray-500 mt-1">{variant.value}</div>
                      )}
                      {variant.price && variant.price !== product.price && (
                        <div className="text-xs font-bold text-blue-600 mt-1">
                          +₹{(variant.price - product.price).toLocaleString()}
                        </div>
                      )}
                      {selectedVariant === variant.id && (
                        <div className="absolute top-1 right-1 bg-blue-500 text-white rounded-full p-1">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            <div>
              <h3 className="text-lg lg:text-2xl font-bold mb-3 lg:mb-6 text-gray-900">Select Size</h3>
              <div className="grid grid-cols-4 gap-2 lg:gap-4">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => handleSizeSelect(size)}
                    className={`p-3 lg:p-6 border-2 rounded-xl lg:rounded-2xl text-center font-bold text-sm lg:text-lg transition-all duration-300 hover:scale-105 ${
                      selectedSize === size
                        ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-lg lg:shadow-xl ring-2 lg:ring-4 ring-blue-100'
                        : 'border-gray-200 hover:border-blue-300 bg-white hover:shadow-lg'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <h3 className="text-lg lg:text-2xl font-bold mb-3 lg:mb-6 text-gray-900">Quantity</h3>
              <div className="flex items-center gap-3 lg:gap-6">
                <div className="flex items-center border-2 border-gray-200 rounded-xl lg:rounded-2xl overflow-hidden bg-white shadow-lg">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    className="rounded-none hover:bg-gray-100 p-3 lg:p-6"
                  >
                    <Minus className="w-4 h-4 lg:w-6 lg:h-6" />
                  </Button>
                  <span className="w-12 lg:w-20 text-center font-bold text-lg lg:text-2xl">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= getCurrentStock()}
                    className="rounded-none hover:bg-gray-100 p-3 lg:p-6"
                  >
                    <Plus className="w-4 h-4 lg:w-6 lg:h-6" />
                  </Button>
                </div>
                <span className="text-gray-700 font-semibold text-sm lg:text-lg">
                  {getCurrentStock()} available
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 lg:space-y-6">
              <Button
                onClick={handleAddToCart}
                disabled={!selectedSize || getCurrentStock() === 0 || (product.hasVariants && !selectedVariant)}
                size="lg"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 lg:py-8 text-base lg:text-xl rounded-xl lg:rounded-2xl shadow-lg lg:shadow-xl hover:shadow-xl lg:hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-5 h-5 lg:w-7 lg:h-7 mr-2 lg:mr-4" />
                {getCurrentStock() === 0 ? 'Out of Stock' : 'Add to Cart'}
              </Button>
              
              <Button
                variant="outline"
                onClick={handleWishlistToggle}
                size="lg"
                className="w-full border-2 border-gray-200 font-bold py-4 lg:py-8 text-base lg:text-xl rounded-xl lg:rounded-2xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-300"
              >
                <Heart className={`w-5 h-5 lg:w-7 lg:h-7 mr-2 lg:mr-4 ${isInWishlist(product._id!.toString()) ? 'fill-red-500 text-red-500' : ''}`} />
                {isInWishlist(product._id!.toString()) ? 'Remove from Wishlist' : 'Add to Wishlist'}
              </Button>
            </div>

            {/* Features */}
            
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-12 lg:mt-20">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className={`grid w-full ${product.sizeChart ? 'grid-cols-5' : 'grid-cols-4'} bg-white/80 backdrop-blur-sm border shadow-lg lg:shadow-xl rounded-xl lg:rounded-2xl p-1 lg:p-2`}>
              <TabsTrigger value="overview" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 rounded-lg lg:rounded-xl font-semibold text-xs lg:text-sm whitespace-nowrap overflow-hidden text-ellipsis">Overview</TabsTrigger>
              <TabsTrigger value="specifications" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 rounded-lg lg:rounded-xl font-semibold text-xs lg:text-sm whitespace-nowrap overflow-hidden text-ellipsis">Specs</TabsTrigger>
              {product.sizeChart && (
                <TabsTrigger value="sizechart" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 rounded-lg lg:rounded-xl font-semibold text-xs lg:text-sm whitespace-nowrap overflow-hidden text-ellipsis">Size Chart</TabsTrigger>
              )}
              <TabsTrigger value="reviews" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 rounded-lg lg:rounded-xl font-semibold text-xs lg:text-sm whitespace-nowrap overflow-hidden text-ellipsis">Reviews</TabsTrigger>
              <TabsTrigger value="shipping" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 rounded-lg lg:rounded-xl font-semibold text-xs lg:text-sm whitespace-nowrap overflow-hidden text-ellipsis">Shipping</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-6 lg:mt-10">
              <Card className="border-0 shadow-lg lg:shadow-2xl bg-white/80 backdrop-blur-sm rounded-2xl lg:rounded-3xl">
                <CardContent className="p-6 lg:p-10">
                  <h3 className="text-xl lg:text-3xl font-bold mb-4 lg:mb-8 text-gray-900">Product Overview</h3>
                  <div className="grid md:grid-cols-2 gap-6 lg:gap-12">
                    <div>
                      <h4 className="text-lg lg:text-xl font-bold mb-3 lg:mb-6 text-gray-900">Description</h4>
                      <p className="text-gray-600 leading-relaxed text-sm lg:text-lg mb-4 lg:mb-8">{product.description}</p>
                      {product.tags && product.tags.length > 0 && (
                        <div className="mt-4 lg:mt-8">
                          <h5 className="font-bold mb-2 lg:mb-4 text-gray-900 text-sm lg:text-lg">Tags:</h5>
                          <div className="flex flex-wrap gap-2 lg:gap-3">
                            {product.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-2 lg:px-4 py-1 lg:py-2 rounded-full font-semibold text-xs lg:text-sm">
                                <Tag className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-lg lg:text-xl font-bold mb-3 lg:mb-6 text-gray-900">Key Features</h4>
                      <div className="space-y-2 lg:space-y-4">
                        <div className="flex items-center space-x-2 lg:space-x-4 p-2 lg:p-4 bg-gray-50 rounded-xl lg:rounded-2xl">
                          <Check className="w-4 h-4 lg:w-6 lg:h-6 text-green-600" />
                          <span className="font-semibold text-gray-900 text-sm lg:text-base">Premium Quality Material</span>
                        </div>
                        <div className="flex items-center space-x-2 lg:space-x-4 p-2 lg:p-4 bg-gray-50 rounded-xl lg:rounded-2xl">
                          <Check className="w-4 h-4 lg:w-6 lg:h-6 text-green-600" />
                          <span className="font-semibold text-gray-900 text-sm lg:text-base">Comfortable Fit</span>
                        </div>
                        <div className="flex items-center space-x-2 lg:space-x-4 p-2 lg:p-4 bg-gray-50 rounded-xl lg:rounded-2xl">
                          <Check className="w-4 h-4 lg:w-6 lg:h-6 text-green-600" />
                          <span className="font-semibold text-gray-900 text-sm lg:text-base">Durable Construction</span>
                        </div>
                        <div className="flex items-center space-x-2 lg:space-x-4 p-2 lg:p-4 bg-gray-50 rounded-xl lg:rounded-2xl">
                          <Check className="w-4 h-4 lg:w-6 lg:h-6 text-green-600" />
                          <span className="font-semibold text-gray-900 text-sm lg:text-base">Modern Design</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="specifications" className="mt-6 lg:mt-10">
              <Card className="border-0 shadow-lg lg:shadow-2xl bg-white/80 backdrop-blur-sm rounded-2xl lg:rounded-3xl">
                <CardContent className="p-6 lg:p-10">
                  <h3 className="text-xl lg:text-3xl font-bold mb-4 lg:mb-8 text-gray-900">Product Specifications</h3>
                  <div className="grid md:grid-cols-2 gap-6 lg:gap-12">
                    <div className="space-y-3 lg:space-y-6">
                      {product.brand && (
                        <div className="flex justify-between py-2 lg:py-4 border-b border-gray-200">
                          <span className="text-gray-600 font-semibold text-sm lg:text-lg">Brand:</span>
                          <span className="font-bold capitalize text-gray-900 text-sm lg:text-lg">{product.brand.name}</span>
                        </div>
                      )}
                      {product.category && (
                        <div className="flex justify-between py-2 lg:py-4 border-b border-gray-200">
                          <span className="text-gray-600 font-semibold text-sm lg:text-lg">Category:</span>
                          <span className="font-bold capitalize text-gray-900 text-sm lg:text-lg">{product.category.name}</span>
                        </div>
                      )}
                      <div className="flex justify-between py-2 lg:py-4 border-b border-gray-200">
                        <span className="text-gray-600 font-semibold text-sm lg:text-lg">SKU:</span>
                        <span className="font-bold text-gray-900 text-sm lg:text-lg">{product.sku}</span>
                      </div>
                      <div className="flex justify-between py-2 lg:py-4 border-b border-gray-200">
                        <span className="text-gray-600 font-semibold text-sm lg:text-lg">Stock:</span>
                        <span className="font-bold text-gray-900 text-sm lg:text-lg">{product.stock} units</span>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="flex justify-between py-4 border-b border-gray-200">
                        <span className="text-gray-600 font-semibold text-sm lg:text-lg">Available Sizes:</span>
                        <span className="font-bold text-gray-900 text-sm lg:text-lg">{product.sizes.join(', ')}</span>
                      </div>
                      {product.specifications && Object.entries(product.specifications).map(([key, value]) => (
                        <div key={key} className="flex justify-between py-4 border-b border-gray-200">
                          <span className="text-gray-600 font-semibold text-sm lg:text-lg capitalize">{key}:</span>
                          <span className="font-bold text-gray-900 text-sm lg:text-lg">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {product.sizeChart && (
              <TabsContent value="sizechart" className="mt-6 lg:mt-10">
                <Card className="border-0 shadow-lg lg:shadow-2xl bg-white/80 backdrop-blur-sm rounded-2xl lg:rounded-3xl">
                  <CardContent className="p-6 lg:p-10">
                    <div className="flex items-center mb-6 lg:mb-8">
                      <Ruler className="w-6 h-6 lg:w-8 lg:h-8 text-blue-600 mr-3 lg:mr-4" />
                      <h3 className="text-xl lg:text-3xl font-bold text-gray-900">Size Chart</h3>
                    </div>
                    <div className="flex justify-center">
                      <div className="max-w-4xl w-full">
                        <img
                          src={product.sizeChart}
                          alt="Size Chart"
                          className="w-full h-auto object-contain rounded-lg lg:rounded-xl border border-gray-200 shadow-md"
                        />
                      </div>
                    </div>
                    <div className="mt-6 lg:mt-8 p-4 lg:p-6 bg-blue-50 rounded-lg lg:rounded-xl border border-blue-200">
                      <div className="flex items-start space-x-3 lg:space-x-4">
                        <Info className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600 mt-1 flex-shrink-0" />
                        <div>
                          <h4 className="font-bold text-blue-800 text-sm lg:text-lg mb-2">How to Measure</h4>
                          <p className="text-blue-700 text-xs lg:text-base leading-relaxed">
                            For the best fit, measure yourself and compare with our size chart. If you're between sizes, we recommend choosing the larger size for comfort.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
            
            <TabsContent value="reviews" className="mt-6 lg:mt-10">
              <Card className="border-0 shadow-lg lg:shadow-2xl bg-white/80 backdrop-blur-sm rounded-3xl">
                <CardContent className="p-10">
                  <div className="mb-8">
                    <h3 className="text-3xl font-bold text-gray-900">Customer Reviews</h3>
                  </div>
                  
                  {/* Reviews load via useEffect; avoid render-time side effects */}
                  
                  {reviewsLoading ? (
                    <div className="text-center py-16">
                      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading reviews...</p>
                    </div>
                  ) : reviews.length > 0 ? (
                    <div className="space-y-8">
                      {reviewStats && (
                        <div className="bg-gray-50 rounded-2xl p-6 mb-8">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-4">
                              <div className="text-4xl font-bold text-gray-900">{reviewStats.averageRating.toFixed(1)}</div>
                              <div>
                                <div className="flex items-center mb-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-5 h-5 ${
                                        i < Math.floor(reviewStats.averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <p className="text-gray-600">{reviewStats.totalReviews} reviews</p>
                              </div>
                            </div>
                            <div className="space-y-2">
                              {[5, 4, 3, 2, 1].map((rating) => (
                                <div key={rating} className="flex items-center space-x-2">
                                  <span className="text-sm text-gray-600 w-2">{rating}</span>
                                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                  <div className="w-20 bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-yellow-400 h-2 rounded-full" 
                                      style={{ width: `${reviewStats.totalReviews ? (((reviewStats.ratingDistribution[rating] || 0) / reviewStats.totalReviews) * 100) : 0}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-sm text-gray-600">{reviewStats.ratingDistribution[rating] || 0}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="space-y-6">
                        {reviews.map((review) => (
                          <div key={review._id?.toString()} className="border-b border-gray-200 pb-6 last:border-b-0">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <div className="flex items-center space-x-3 mb-2">
                                  <h4 className="font-bold text-gray-900">{review.reviewerName || 'Anonymous'}</h4>
                                  <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`w-4 h-4 ${
                                          i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>
                                <p className="text-gray-600 text-sm">{new Date(review.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                        <StarIcon className="w-12 h-12 text-gray-400" />
                      </div>
                      <h4 className="text-2xl font-bold text-gray-900 mb-4">No reviews yet</h4>
                      <p className="text-gray-600 text-lg">Reviews can be written after purchasing this product from your orders page.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="shipping" className="mt-6 lg:mt-10">
              <Card className="border-0 shadow-lg lg:shadow-2xl bg-white/80 backdrop-blur-sm rounded-2xl lg:rounded-3xl">
                <CardContent className="p-6 lg:p-10">
                  <h3 className="text-2xl lg:text-3xl font-bold mb-6 lg:mb-8 text-gray-900">Shipping & Packaging</h3>
                  <div className="space-y-6 lg:space-y-8">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4 lg:space-x-8 p-6 lg:p-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl lg:rounded-3xl border border-green-200">
                      <div className="w-16 h-16 lg:w-20 lg:h-20 bg-green-100 rounded-xl lg:rounded-3xl flex items-center justify-center flex-shrink-0">
                        <Truck className="w-8 h-8 lg:w-10 lg:h-10 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0 text-center sm:text-left">
                        <h4 className="font-bold text-green-800 text-xl lg:text-2xl mb-3 lg:mb-4">Free Shipping</h4>
                        <p className="text-green-600 text-base lg:text-lg leading-relaxed">Free shipping on orders above ₹999. Standard delivery takes 3-5 business days. Express shipping available for additional charges.</p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4 lg:space-x-8 p-6 lg:p-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl lg:rounded-3xl border border-blue-200">
                      <div className="w-16 h-16 lg:w-20 lg:h-20 bg-purple-100 rounded-xl lg:rounded-3xl flex items-center justify-center flex-shrink-0">
                        <Package className="w-8 h-8 lg:w-10 lg:h-10 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0 text-center sm:text-left">
                        <h4 className="font-bold text-purple-800 text-xl lg:text-2xl mb-3 lg:mb-4">Secure Packaging</h4>
                        <p className="text-purple-600 text-base lg:text-lg leading-relaxed">All items are carefully packaged to ensure safe delivery. We use eco-friendly packaging materials whenever possible.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-2xl lg:text-4xl font-bold text-gray-900">Related Products</h2>
              <Link href="/products">
                <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50 rounded-2xl px-6 py-3 font-semibold">
                  View All Products
                  <ArrowLeft className="ml-3 w-5 h-5 rotate-180" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map((relatedProduct) => (
                <Link key={relatedProduct._id?.toString() || Math.random().toString()} href={`/products/${relatedProduct._id}`}>
                  <Card className="group cursor-pointer hover:shadow-2xl transition-all duration-300 border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden max-w-full">
                    <div className="relative aspect-square overflow-hidden">
                      <Image
                        src={relatedProduct.images[0] || '/placeholder.jpg'}
                        alt={relatedProduct.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                      {relatedProduct.offerPrice && (
                        <Badge className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold px-3 py-1 rounded-full shadow-lg z-10">
                          {Math.round(((relatedProduct.price - relatedProduct.offerPrice) / relatedProduct.price) * 100)}% OFF
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-6">
                      <h3 className="font-bold text-gray-900 truncate mb-2 text-lg">{relatedProduct.name}</h3>
                      {relatedProduct.brand?.name && (
                  <p className="text-gray-500 mb-3 font-medium">{relatedProduct.brand.name}</p>
                )}
                      <div className="flex items-center space-x-3">
                        {relatedProduct.offerPrice ? (
                          <>
                            <span className="font-bold text-gray-900 text-xl">₹{relatedProduct.offerPrice.toLocaleString()}</span>
                            <span className="text-gray-500 line-through">₹{relatedProduct.price.toLocaleString()}</span>
                          </>
                        ) : (
                          <span className="font-bold text-gray-900 text-xl">₹{relatedProduct.price.toLocaleString()}</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
