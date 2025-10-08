"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Heart, ShoppingCart, Trash2, ArrowLeft, Star } from 'lucide-react'
import { Product } from '@/lib/types'
import { useCart } from '@/contexts/CartContext'
import { useWishlist } from '@/contexts/WishlistContext'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'

export default function WishlistPage() {
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { addItem } = useCart()
  const { items: wishlistItems, removeItem: removeFromWishlist } = useWishlist()
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (user && wishlistItems.length > 0) {
      fetchWishlistProducts()
    } else {
      setLoading(false)
    }
  }, [user, wishlistItems])

  const fetchWishlistProducts = async () => {
    try {
      const productPromises = wishlistItems.map(async (productId) => {
        const response = await fetch(`/api/products/${productId}`)
        if (response.ok) {
          const data = await response.json()
          return data.success ? data.data : null
        }
        return null
      })

      const products = await Promise.all(productPromises)
      setWishlistProducts(products.filter(Boolean))
    } catch (error) {
      console.error('Error fetching wishlist products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = (product: Product, size: string) => {
    addItem({
      productId: product._id!.toString(),
      name: product.name,
      price: product.price,
      offerPrice: product.offerPrice,
      quantity: 1,
      size,
      image: product.images[0],
      stock: product.stock,
    })
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart`,
    })
  }

  const handleRemoveFromWishlist = (productId: string) => {
    removeFromWishlist(productId)
    setWishlistProducts(prev => prev.filter(p => p._id?.toString() !== productId))
    toast({
      title: "Removed from wishlist",
      description: "Item has been removed from your wishlist",
    })
  }

  const handleMoveAllToCart = () => {
    wishlistProducts.forEach(product => {
      if (product.sizes.length > 0) {
        addItem({
          productId: product._id!.toString(),
          name: product.name,
          price: product.price,
          offerPrice: product.offerPrice,
          quantity: 1,
          size: product.sizes[0],
          image: product.images[0],
          stock: product.stock,
        })
      }
    })
    toast({
      title: "Added to cart",
      description: "All items have been added to your cart",
    })
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Please login</h1>
            <p className="text-gray-600 mb-8">You need to be logged in to view your wishlist.</p>
            <Link href="/login">
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/account" className="inline-flex items-center text-sm text-gray-600 hover:text-purple-600 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Account
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wishlist</h1>
              <p className="text-gray-600">
                {wishlistProducts.length} {wishlistProducts.length === 1 ? 'item' : 'items'} in your wishlist
              </p>
            </div>
            {wishlistProducts.length > 0 && (
              <Button
                onClick={handleMoveAllToCart}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Move All to Cart
              </Button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border p-4 animate-pulse">
                <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                <div className="space-y-2">
                  <div className="bg-gray-200 h-4 rounded"></div>
                  <div className="bg-gray-200 h-4 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : wishlistProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlistProducts.map((product) => {
              const discount = product.offerPrice ? Math.round(((product.price - product.offerPrice) / product.price) * 100) : 0

              return (
                <Card key={product._id?.toString()} className="group relative overflow-hidden hover:shadow-lg transition-all duration-300">
                  <Link href={`/products/${product._id}`} className="block">
                    <div className="relative aspect-square overflow-hidden">
                      <Image
                        src={product.images[0] || '/placeholder.jpg'}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {discount > 0 && (
                        <Badge className="absolute top-2 left-2 bg-red-500 text-white">
                          -{discount}%
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-4 pb-12">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-sm line-clamp-2">{product.name}</h3>
                        {product.brand?.name && (
                <p className="text-xs text-gray-500">{product.brand.name}</p>
              )}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-lg">
                              ₹{product.offerPrice || product.price}
                            </span>
                            {product.offerPrice && (
                              <span className="text-sm text-gray-500 line-through">
                                ₹{product.price}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs">{product.rating || 4.5}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Link>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white z-10"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleRemoveFromWishlist(product._id!.toString())
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                  <div className="absolute bottom-4 left-4 right-4 flex gap-2 z-10">
                    {product.sizes.slice(0, 3).map((size) => (
                      <Button
                        key={size}
                        size="sm"
                        variant="outline"
                        className="text-xs h-8 bg-white/90 hover:bg-white"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleAddToCart(product, size)
                        }}
                      >
                        {size}
                      </Button>
                    ))}
                  </div>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-8">
              Start adding items to your wishlist to save them for later
            </p>
            <Link href="/products">
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                Start Shopping
                <ArrowLeft className="ml-2 w-4 h-4 rotate-180" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
