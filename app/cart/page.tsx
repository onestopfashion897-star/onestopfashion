"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, Heart, Truck, Shield, Package, CreditCard, X } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { useWishlist } from '@/contexts/WishlistContext'
import { useAuth } from '@/contexts/AuthContext'
import { Navbar } from '@/components/ui/navbar'
import { useToast } from '@/hooks/use-toast'

export default function CartPage() {
  const router = useRouter()
  const { items, updateQuantity, removeItem, clearCart, getTotal, getItemCount } = useCart()
  const { addItem: addToWishlist, isInWishlist, removeItem: removeFromWishlist } = useWishlist()
  const { user } = useAuth()
  const { toast } = useToast()
  const [couponCode, setCouponCode] = useState('')
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponLoading, setCouponLoading] = useState(false)

  const subtotal = getTotal()
  const shipping = subtotal > 999 ? 0 : 99
  const total = subtotal + shipping - couponDiscount

  // Real-time coupon validation when cart total changes
  useEffect(() => {
    const validateCouponOnCartChange = async () => {
      if (couponCode && couponDiscount > 0) {
        try {
          const response = await fetch('/api/coupons/validate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              code: couponCode,
              subtotal: subtotal,
            }),
          })

          const data = await response.json()

          if (!data.success) {
            // Coupon is no longer valid (e.g., cart value below minimum threshold)
            setCouponCode('')
            setCouponDiscount(0)
            toast({
              title: "Coupon removed",
              description: data.error || "Coupon is no longer valid for current cart value",
              variant: "destructive",
            })
          } else {
            // Update discount in case it changed
            setCouponDiscount(data.data.discount)
          }
        } catch (error) {
          console.error('Error validating coupon:', error)
        }
      }
    }

    validateCouponOnCartChange()
  }, [subtotal, couponCode, couponDiscount, toast])

  const handleQuantityChange = (productId: string, size: string, newQuantity: number, variantId?: string) => {
    if (newQuantity < 1) return
    updateQuantity(productId, size, newQuantity, variantId)
  }

  const handleRemoveItem = (productId: string, size: string, variantId?: string) => {
    removeItem(productId, size, variantId)
    toast({
      title: "Item removed",
      description: "Item has been removed from your cart",
    })
  }

  const handleMoveToWishlist = (item: any) => {
    removeItem(item.productId, item.size, item.variantId)
    addToWishlist(item.productId)
    toast({
      title: "Moved to wishlist",
      description: "Item has been moved to your wishlist",
    })
  }

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return

    setCouponLoading(true)
    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: couponCode,
          subtotal: subtotal,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setCouponDiscount(data.data.discount)
        toast({
          title: "Coupon applied!",
          description: `You saved ₹${data.data.discount}`,
        })
      } else {
        toast({
          title: "Invalid coupon",
          description: data.error || "Please check your coupon code",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to apply coupon",
        variant: "destructive",
      })
    } finally {
      setCouponLoading(false)
    }
  }

  const handleRemoveCoupon = () => {
    setCouponCode('')
    setCouponDiscount(0)
    toast({
      title: "Coupon removed",
      description: "Coupon has been removed from your order",
    })
  }

  const handleCheckout = () => {
    if (!user) {
      toast({
        title: "Please login",
        description: "You need to be logged in to checkout",
        variant: "destructive",
      })
      return
    }
    // Navigate to checkout using Next.js router
    router.push('/checkout')
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Navbar />
        <div className="container mx-auto px-4 py-16 pt-20">
          <div className="text-center max-w-md mx-auto">
            <div className="w-32 h-32 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-8">
              <ShoppingBag className="w-16 h-16 text-gray-400" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-6">Your cart is empty</h1>
            <p className="text-gray-600 mb-10 text-lg leading-relaxed">Looks like you haven't added any items to your cart yet. Start shopping to discover amazing products!</p>
            <Link href="/products">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 text-lg font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300">
                Start Shopping
                <ArrowLeft className="ml-3 w-5 h-5 rotate-180" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8 pt-20">
        {/* Header */}
        <div className="mb-8">
          <Link href="/products" className="inline-flex items-center text-sm text-gray-600 hover:text-blue-600 mb-6 transition-colors font-medium">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Continue Shopping
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
          <p className="text-gray-600 text-lg">{getItemCount()} items in your cart</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-3xl">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl font-bold text-gray-900">Cart Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {items.map((item, index) => (
                  <div key={`${item.productId}-${item.size}${item.variantId ? `-${item.variantId}` : ''}-${index}`}>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-6 bg-gray-50 rounded-2xl">
                      <div className="relative w-24 h-24 sm:w-20 sm:h-20 overflow-hidden rounded-2xl flex-shrink-0">
                        <Image
                          src={item.image || '/placeholder.jpg'}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 96px, 80px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-lg mb-2">{item.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3 flex-wrap">
                          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold">Size: {item.size}</span>
                          {item.variantName && (
                            <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-semibold">
                              {item.variantType === 'color' ? 'Color' : 'Model'}: {item.variantName}
                            </span>
                          )}
                          <span className="font-semibold text-lg">₹{(item.offerPrice || item.price).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between sm:justify-start gap-4">
                          <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden bg-white">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleQuantityChange(item.productId, item.size, item.quantity - 1, item.variantId)}
                              disabled={item.quantity <= 1}
                              className="rounded-none hover:bg-gray-100 p-3"
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="w-12 text-center font-bold text-lg">{item.quantity}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleQuantityChange(item.productId, item.size, item.quantity + 1, item.variantId)}
                              className="rounded-none hover:bg-gray-100 p-3"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="text-right sm:text-left">
                            <p className="font-bold text-xl text-gray-900">₹{((item.offerPrice || item.price) * item.quantity).toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 self-end sm:self-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleMoveToWishlist(item)}
                          className="rounded-full hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                          <Heart className="w-5 h-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveItem(item.productId, item.size, item.variantId)}
                          className="rounded-full hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                    {index < items.length - 1 && <Separator className="my-6" />}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-3xl sticky top-24">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl font-bold text-gray-900">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Coupon Code */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-700">Coupon Code</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="rounded-xl border-2 focus:border-blue-500"
                    />
                    <Button
                      variant="outline"
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                      className="rounded-xl border-2 hover:bg-blue-50 hover:border-blue-500"
                    >
                      {couponLoading ? 'Applying...' : 'Apply'}
                    </Button>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex items-center justify-between">
                      <Badge className="bg-green-100 text-green-800 px-3 py-2 rounded-full font-semibold">
                        Coupon applied: -₹{couponDiscount.toLocaleString()}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveCoupon}
                        className="h-6 w-6 p-0 hover:bg-green-200 rounded-full ml-2"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Price Breakdown */}
                <div className="space-y-4">
                  <div className="flex justify-between text-lg">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-lg">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-semibold">{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-lg text-green-600">
                      <span>Coupon Discount</span>
                      <span className="font-semibold">-₹{couponDiscount.toLocaleString()}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-2xl font-bold text-gray-900">
                    <span>Total</span>
                    <span>₹{total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                    <Truck className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-green-700 font-medium">Free shipping on orders above ₹999</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <span className="text-sm text-blue-700 font-medium">30-day return policy</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
                    <Package className="w-5 h-5 text-purple-600" />
                    <span className="text-sm text-purple-700 font-medium">Secure packaging</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <Button
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-6 text-lg font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300"
                  onClick={handleCheckout}
                  disabled={!user}
                >
                  <CreditCard className="w-5 h-5 mr-3" />
                  {user ? 'Proceed to Checkout' : 'Login to Checkout'}
                </Button>

                {!user && (
                  <p className="text-sm text-gray-500 text-center">
                    Please <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">login</Link> to continue with checkout
                  </p>
                )}

                {/* Clear Cart */}
                <Button
                  variant="outline"
                  className="w-full border-2 border-gray-200 hover:border-red-300 hover:bg-red-50 hover:text-red-600 rounded-2xl py-4 font-semibold transition-all duration-300"
                  onClick={clearCart}
                >
                  Clear Cart
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
