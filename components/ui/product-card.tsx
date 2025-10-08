"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, ShoppingCart, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Product } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { useCart } from "@/contexts/CartContext"
import { useWishlist } from "@/contexts/WishlistContext"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart()
  const { addItem: addToWishlist, isInWishlist, removeItem: removeFromWishlist } = useWishlist()
  const { toast } = useToast()

  const discountPercentage = product.offerPrice
    ? Math.round(((product.price - product.offerPrice) / product.price) * 100)
    : 0

  const [reviewStats, setReviewStats] = useState<{ averageRating: number; totalReviews: number } | null>(null)

  useEffect(() => {
    const fetchReviewStats = async () => {
      try {
        const res = await fetch(`/api/reviews/stats?productId=${product._id}`)
        if (res.ok) {
          const data = await res.json()
          if (data?.data) {
            setReviewStats({
              averageRating: data.data.averageRating,
              totalReviews: data.data.totalReviews,
            })
          }
        }
      } catch (err) {
        // silently ignore
      }
    }
    fetchReviewStats()
  }, [product._id])

  // Safely derive brand name as a string to avoid ReactNode type issues
  const brandName =
    typeof product.brand === 'object' && product.brand && (product.brand as any).name
      ? (product.brand as any).name as string
      : typeof product.brand === 'string'
      ? (product.brand as string)
      : 'Happy Feet'

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Add item with default size (first available size)
    const defaultSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'M'
    
    addItem({
      productId: product._id!.toString(),
      name: product.name,
      price: product.price,
      offerPrice: product.offerPrice,
      quantity: 1,
      size: defaultSize,
      image: product.images[0],
      stock: product.stock,
    })

    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
    })
  }

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const isCurrentlyInWishlist = isInWishlist(product._id!.toString())
    
    if (isCurrentlyInWishlist) {
      removeFromWishlist(product._id!.toString())
      toast({
        title: "Removed from Wishlist",
        description: `${product.name} has been removed from your wishlist.`,
      })
    } else {
      addToWishlist(product._id!.toString())
      toast({
        title: "Added to Wishlist",
        description: `${product.name} has been added to your wishlist.`,
      })
    }
  }

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden border-2 border-gray-100 hover:border-blue-500 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      {/* Product Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-50">
        <Link href={`/products/${product._id}`} className="block w-full h-full">
          <Image
            src={product.images[0] || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
          />
        </Link>

        {/* Discount Badge */}
        {discountPercentage > 0 && (
          <div className="absolute top-3 left-3 z-10">
            <Badge className="bg-red-500 text-white font-bold px-3 py-1 text-xs rounded-full shadow-lg">
              -{discountPercentage}%
            </Badge>
          </div>
        )}

        {/* Wishlist Button */}
        <Button
          variant="ghost"
          size="icon"
          className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white shadow-lg transition-all duration-300 ${
            isInWishlist(product._id!.toString()) 
              ? "text-red-500 hover:bg-red-50" 
              : "text-gray-600 hover:bg-gray-50"
          }`}
          onClick={handleWishlistToggle}
        >
          <Heart className={`w-5 h-5 ${isInWishlist(product._id!.toString()) ? "fill-current" : ""}`} />
        </Button>

        {/* Quick Add to Cart - Appears on Hover */}
        <div className="absolute inset-x-3 bottom-3 z-10 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          <Button 
            onClick={handleAddToCart} 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg" 
            size="sm"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4 space-y-2">
        {/* Brand */}
        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
          {brandName}
        </p>

        {/* Product Name */}
        <Link href={`/products/${product._id}`} className="block">
          <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors duration-200 line-clamp-2 text-base leading-tight">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`w-4 h-4 ${
                  i < Math.floor((reviewStats?.averageRating ?? product.rating ?? 0)) 
                    ? "text-yellow-400 fill-current" 
                    : "text-gray-200"
                }`} 
              />
            ))}
          </div>
          <span className="text-sm text-gray-600 font-medium ml-1">
            {(reviewStats?.averageRating ?? product.rating ?? 0).toFixed(1)}
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 pt-2">
          {product.offerPrice ? (
            <>
              <span className="text-xl font-bold text-gray-900">
                ₹{product.offerPrice.toLocaleString()}
              </span>
              <span className="text-sm text-gray-400 line-through">
                ₹{product.price.toLocaleString()}
              </span>
            </>
          ) : (
            <span className="text-xl font-bold text-gray-900">
              ₹{product.price.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
