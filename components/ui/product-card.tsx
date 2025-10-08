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
      : 'one stop fashion brand'

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
    <div className="group relative bg-white rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg">
      {/* Product Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
        <Link href={`/products/${product._id}`} className="block w-full h-full">
          <Image
            src={product.images[0] || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
          />
        </Link>

        {/* Quick Add to Cart - Appears on Hover */}
        <div className="absolute inset-x-3 bottom-3 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <Button 
            onClick={handleAddToCart} 
            className="w-full bg-black hover:bg-gray-800 text-white rounded-full" 
            size="sm"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4 space-y-1">
        {/* Product Name */}
        <Link href={`/products/${product._id}`} className="block">
          <h3 className="font-medium text-gray-900 hover:text-gray-600 line-clamp-2 text-sm">
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-center gap-2">
          {product.offerPrice ? (
            <>
              <span className="text-lg font-semibold text-gray-900">
                ₹{product.offerPrice.toLocaleString()}
              </span>
              <span className="text-xs text-gray-400 line-through">
                ₹{product.price.toLocaleString()}
              </span>
            </>
          ) : (
            <span className="text-lg font-semibold text-gray-900">
              ₹{product.price.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
