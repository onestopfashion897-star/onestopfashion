"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Mail, 
  CreditCard, 
  Truck, 
  Shield, 
  Package,
  CheckCircle,
  AlertCircle,
  Plus
} from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { Navbar } from '@/components/ui/navbar'
import { RazorpayScript } from '@/components/razorpay-script'
import { useToast } from '@/hooks/use-toast'

import Image from 'next/image'

interface Address {
  id?: string
  name: string
  phone: string
  address: string
  city: string
  state: string
  pincode: string
  isDefault: boolean
}

interface PaymentMethod {
  id: string
  name: string
  icon: string
  description: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotal, clearCart } = useCart()
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null)
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([])
  const [addressesLoading, setAddressesLoading] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('cod')
  const [couponCode, setCouponCode] = useState('')
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponLoading, setCouponLoading] = useState(false)

  const subtotal = getTotal()
  const shipping = subtotal > 999 ? 0 : 99
  const total = subtotal + shipping - couponDiscount

  const [showPaymentError, setShowPaymentError] = useState(false)

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'debit-card',
      name: 'Debit Card',
      icon: '💳',
      description: 'Pay securely with your debit card'
    },
    {
      id: 'credit-card',
      name: 'Credit Card',
      icon: '💳',
      description: 'Pay securely with your credit card'
    },
    {
      id: 'upi',
      name: 'UPI',
      icon: '📱',
      description: 'Pay using UPI apps'
    },
    {
      id: 'cod',
      name: 'Cash on Delivery',
      icon: '💵',
      description: 'Pay when you receive'
    }
  ]

  useEffect(() => {
    // Wait for authentication to load before checking
    if (authLoading) {
      console.log('Auth is still loading...')
      return
    }

    console.log('Auth loaded. User:', user, 'Items:', items.length)

    if (!user) {
      console.log('No user found, redirecting to login')
      router.push('/login')
      return
    }
    
    // Don't redirect to cart if items are empty during payment processing
    // This prevents redirect loops when cart is cleared after successful payment
    if (items.length === 0 && !loading) {
      console.log('No items in cart, redirecting to cart')
      router.push('/cart')
      return
    }

    // Fetch saved addresses
    fetchSavedAddresses()
  }, [user, items, router, authLoading, loading])

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

  const fetchSavedAddresses = async () => {
    if (!user) return
    
    setAddressesLoading(true)
    try {
      const response = await fetch('/api/users/addresses', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setSavedAddresses(data.data || [])
        
        // Auto-select default address if available
        const defaultAddress = data.data?.find((addr: Address) => addr.isDefault)
        if (defaultAddress) {
          setSelectedAddress(defaultAddress)
        }
      }
    } catch (error) {
      console.error('Error fetching addresses:', error)
    } finally {
      setAddressesLoading(false)
    }
  }

  const handleAddressSubmit = (address: Address) => {
    setSelectedAddress(address)
    setCurrentStep(2)
  }

  // Show loading while authentication is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Navbar />
        <RazorpayScript />
        <div className="container mx-auto px-4 py-16 pt-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading checkout...</h2>
            <p className="text-gray-600">Please wait while we verify your authentication.</p>
          </div>
        </div>
      </div>
    )
  }

  // Don't render anything if user is not authenticated or cart is empty
  if (!user || items.length === 0) {
    return null
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

  const handleRazorpayPayment = async (orderId: string, amount: number) => {
    try {
      // Create Razorpay order
      const razorpayOrderResponse = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          amount: amount,
          receipt: `order_${orderId}`,
          notes: {
            orderId: orderId
          }
        }),
      })

      const razorpayOrderData = await razorpayOrderResponse.json()

      if (!razorpayOrderData.success) {
        throw new Error(razorpayOrderData.error || 'Failed to create payment order')
      }

      // Open Razorpay payment modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: razorpayOrderData.data.amount,
        currency: razorpayOrderData.data.currency,
        name: 'onestopfashionbrand Store',
        description: 'Order Payment',
        order_id: razorpayOrderData.data.orderId,
        handler: async function (response: any) {
          // Payment successful, verify payment
          await verifyRazorpayPayment(response, orderId)
        },
        prefill: {
          name: selectedAddress?.name || user?.name || '',
          email: user?.email || '',
          contact: selectedAddress?.phone || ''
        },
        theme: {
          color: '#3B82F6'
        },
        modal: {
          ondismiss: async function() {
            // Cancel the order and redirect to payment failure page when payment is cancelled
            await cancelFailedOrder(orderId, 'Payment was cancelled by user')
            router.push(`/payment-result?status=failed&orderId=${orderId}&error=${encodeURIComponent('Payment was cancelled by user')}`)
          }
        }
      }

      const razorpay = new (window as any).Razorpay(options)
      razorpay.open()

    } catch (error) {
      console.error('Razorpay payment error:', error)
      toast({
        title: "Payment failed",
        description: "Please try again or choose a different payment method",
        variant: "destructive",
      })
    }
  }

  const cancelFailedOrder = async (orderId: string, reason: string) => {
    try {
      await fetch(`/api/orders/${orderId}/cancel-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({ reason }),
      })
    } catch (error) {
      console.error('Error cancelling failed order:', error)
    }
  }

  const verifyRazorpayPayment = async (paymentResponse: any, orderId: string) => {
    try {
      const verificationResponse = await fetch('/api/razorpay/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          razorpay_order_id: paymentResponse.razorpay_order_id,
          razorpay_payment_id: paymentResponse.razorpay_payment_id,
          razorpay_signature: paymentResponse.razorpay_signature,
          orderId: orderId
        }),
      })

      const verificationData = await verificationResponse.json()

      if (verificationData.success) {
        // Redirect to payment success page first, then clear cart
        router.push(`/payment-result?status=success&orderId=${orderId}&paymentId=${paymentResponse.razorpay_payment_id}`)
        // Clear cart after a small delay to ensure navigation happens first
        setTimeout(() => {
          clearCart()
        }, 100)
      } else {
        // Cancel the order and redirect to payment failure page
        await cancelFailedOrder(orderId, 'Payment verification failed')
        router.push(`/payment-result?status=failed&orderId=${orderId}&error=${encodeURIComponent(verificationData.error || 'Payment verification failed')}`)
      }

    } catch (error) {
      console.error('Payment verification error:', error)
      // Cancel the order and redirect to payment failure page
      await cancelFailedOrder(orderId, 'Payment verification failed')
      router.push(`/payment-result?status=failed&orderId=${orderId}&error=${encodeURIComponent('Payment verification failed')}`)
    }
  }

  const handlePaymentSubmit = async () => {
    if (!selectedAddress) {
      toast({
        title: "Address required",
        description: "Please add a delivery address",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const orderPayload = {
        items: items.map(item => ({
          productId: item.productId,
          name: item.name,
          quantity: item.quantity,
          price: item.offerPrice || item.price,
          size: item.size,
          image: item.image
        })),
        shippingAddress: {
          name: selectedAddress?.name || '',
          phone: selectedAddress?.phone || '',
          address: selectedAddress?.address || '',
          city: selectedAddress?.city || '',
          state: selectedAddress?.state || '',
          pincode: selectedAddress?.pincode || ''
        },
        paymentMethod: selectedPaymentMethod,
        subtotal: subtotal,
        discount: couponDiscount,
        shipping: shipping,
        total: total
      }

      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(orderPayload),
      })

      const orderData = await orderResponse.json()

      if (!orderData.success) {
        throw new Error(orderData.error || 'Failed to create order')
      }

      const orderId = orderData.data.order._id
      router.push(`/order-confirmation?orderId=${orderId}`)
      setTimeout(() => clearCart(), 500)
    } catch (error) {
      console.error('Order creation error:', error)
      toast({
        title: "Order failed",
        description: "Please try again",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Navbar />
      <RazorpayScript />
      <div className="container mx-auto px-4 py-8 pt-20">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-sm text-gray-600 hover:text-blue-600 mb-6 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cart
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-gray-600 text-lg">Complete your purchase</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className={`flex items-center ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep >= 1 ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300'}`}>
                {currentStep > 1 ? <CheckCircle className="w-5 h-5" /> : '1'}
              </div>
              <span className="ml-2 font-semibold">Address</span>
            </div>
            <div className={`w-16 h-1 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep >= 2 ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300'}`}>
                {currentStep > 2 ? <CheckCircle className="w-5 h-5" /> : '2'}
              </div>
              <span className="ml-2 font-semibold">Payment</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Address */}
            {currentStep === 1 && (
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-3xl">
                <CardHeader className="pb-6">
                  <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
                    <MapPin className="w-6 h-6 mr-3 text-blue-600" />
                    Delivery Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AddressForm 
                    savedAddresses={savedAddresses}
                    selectedAddress={selectedAddress}
                    onSelectAddress={setSelectedAddress}
                    addressesLoading={addressesLoading}
                    onSubmit={handleAddressSubmit}
                  />
                </CardContent>
              </Card>
            )}

            {/* Step 2: Payment */}
            {currentStep === 2 && (
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-3xl">
                <CardHeader className="pb-6">
                  <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
                    <CreditCard className="w-6 h-6 mr-3 text-blue-600" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4">
                    {paymentMethods.map((method) => {
                      return (
                        <div
                          key={method.id}
                          className={`p-4 border-2 rounded-2xl transition-all cursor-pointer ${
                            selectedPaymentMethod === method.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-blue-300'
                          }`}
                          onClick={() => setSelectedPaymentMethod(method.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <span className="text-2xl">{method.icon}</span>
                              <div>
                                <h3 className="font-semibold text-gray-900">
                                  {method.name}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {method.description}
                                </p>
                              </div>
                            </div>
                            {selectedPaymentMethod === method.id && (
                              <CheckCircle className="w-6 h-6 text-blue-600" />
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Payment Details Forms */}
                  {selectedPaymentMethod === 'debit-card' && (
                    <div className="p-6 bg-gray-50 rounded-2xl border-2 border-gray-200 space-y-4">
                      <h4 className="font-semibold text-gray-900">Enter Debit Card Details</h4>
                      <div className="space-y-4">
                        <Input placeholder="Card Number" className="rounded-xl" />
                        <div className="grid grid-cols-2 gap-4">
                          <Input placeholder="MM/YY" className="rounded-xl" />
                          <Input placeholder="CVV" type="password" className="rounded-xl" />
                        </div>
                        <Input placeholder="Cardholder Name" className="rounded-xl" />
                      </div>
                      <div className="p-4 bg-red-50 border border-red-200 rounded-xl mt-4">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-red-800">Payment Not Available</h4>
                            <p className="text-sm text-red-700">Only Cash on Delivery is available for your location at this time.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedPaymentMethod === 'credit-card' && (
                    <div className="p-6 bg-gray-50 rounded-2xl border-2 border-gray-200 space-y-4">
                      <h4 className="font-semibold text-gray-900">Enter Credit Card Details</h4>
                      <div className="space-y-4">
                        <Input placeholder="Card Number" className="rounded-xl" />
                        <div className="grid grid-cols-2 gap-4">
                          <Input placeholder="MM/YY" className="rounded-xl" />
                          <Input placeholder="CVV" type="password" className="rounded-xl" />
                        </div>
                        <Input placeholder="Cardholder Name" className="rounded-xl" />
                      </div>
                      <div className="p-4 bg-red-50 border border-red-200 rounded-xl mt-4">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-red-800">Payment Not Available</h4>
                            <p className="text-sm text-red-700">Only Cash on Delivery is available for your location at this time.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedPaymentMethod === 'upi' && (
                    <div className="p-6 bg-gray-50 rounded-2xl border-2 border-gray-200 space-y-4">
                      <h4 className="font-semibold text-gray-900">Enter UPI Details</h4>
                      <div className="space-y-4">
                        <Input placeholder="UPI ID (e.g., yourname@paytm)" className="rounded-xl" />
                      </div>
                      <div className="p-4 bg-red-50 border border-red-200 rounded-xl mt-4">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-red-800">Payment Not Available</h4>
                            <p className="text-sm text-red-700">Only Cash on Delivery is available for your location at this time.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Security Notice */}
                  <div className="p-4 bg-green-50 rounded-2xl border border-green-200">
                    <div className="flex items-start space-x-3">
                      <Shield className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-green-800">Secure Payment</h4>
                        <p className="text-sm text-green-700">Your payment information is encrypted and secure. We never store your card details.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-3xl sticky top-24">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl font-bold text-gray-900">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Items */}
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={`${item.productId}-${item.size}`} className="flex items-center space-x-4">
                      <div className="relative w-16 h-16 overflow-hidden rounded-xl">
                        <Image
                          src={item.image || '/placeholder.jpg'}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate">{item.name}</h4>
                        <p className="text-sm text-gray-600">Size: {item.size} • Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">₹{((item.offerPrice || item.price) * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

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
                    <Badge className="bg-green-100 text-green-800 px-3 py-2 rounded-full font-semibold">
                      Coupon applied: -₹{couponDiscount.toLocaleString()}
                    </Badge>
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

                {/* Action Buttons */}
                {currentStep === 1 && (
                  <Button
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-6 text-lg font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300"
                    onClick={() => {
                      console.log('Continue to Payment clicked, selectedAddress:', selectedAddress)
                      setCurrentStep(2)
                    }}
                    disabled={!selectedAddress}
                  >
                    Continue to Payment
                  </Button>
                )}

                {currentStep === 2 && (
                  <Button
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-6 text-lg font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handlePaymentSubmit}
                    disabled={loading || selectedPaymentMethod !== 'cod'}
                  >
                    {loading ? 'Processing...' : selectedPaymentMethod !== 'cod' ? 'Only COD Available' : `Pay ₹${total.toLocaleString()}`}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

// Address Form Component
function AddressForm({ 
  savedAddresses, 
  selectedAddress, 
  onSelectAddress, 
  addressesLoading,
  onSubmit 
}: { 
  savedAddresses: Address[]
  selectedAddress: Address | null
  onSelectAddress: (address: Address) => void
  addressesLoading: boolean
  onSubmit?: (address: Address) => void
}) {
  const [showNewAddressForm, setShowNewAddressForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newAddress: Address = {
      ...formData,
      isDefault: false,
    }
    onSelectAddress(newAddress)
    if (onSubmit) {
      onSubmit(newAddress)
    }
    setShowNewAddressForm(false)
  }

  if (addressesLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading addresses...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Saved Addresses */}
      {savedAddresses.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Select Delivery Address</h3>
          <div className="grid gap-4">
            {savedAddresses.map((address) => (
              <div
                key={address.id}
                className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                  selectedAddress && (
                    (selectedAddress.id && selectedAddress.id === address.id) ||
                    (!selectedAddress.id && selectedAddress.name === address.name && selectedAddress.phone === address.phone)
                  )
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => {
                  console.log('Address selected:', address)
                  onSelectAddress(address)
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900">{address.name}</h4>
                      {address.isDefault && (
                        <Badge variant="outline" className="text-xs">Default</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{address.address}</p>
                    <p className="text-sm text-gray-600 mb-1">
                      {address.city}, {address.state} {address.pincode}
                    </p>
                    <p className="text-sm text-gray-600">Phone: {address.phone}</p>
                  </div>
                  <div className="ml-4">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedAddress && (
                        (selectedAddress.id && selectedAddress.id === address.id) ||
                        (!selectedAddress.id && selectedAddress.name === address.name && selectedAddress.phone === address.phone)
                      )
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedAddress && (
                        (selectedAddress.id && selectedAddress.id === address.id) ||
                        (!selectedAddress.id && selectedAddress.name === address.name && selectedAddress.phone === address.phone)
                      ) && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add New Address Button */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={() => setShowNewAddressForm(!showNewAddressForm)}
          className="rounded-xl border-2 hover:bg-blue-50 hover:border-blue-500"
        >
          <Plus className="w-4 h-4 mr-2" />
          {savedAddresses.length > 0 ? 'Add New Address' : 'Add Delivery Address'}
        </Button>
      </div>

      {/* New Address Form */}
      {showNewAddressForm && (
        <div className="border-2 border-gray-200 rounded-xl p-6 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Address</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="rounded-xl border-2 focus:border-blue-500"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                <Input
                  required
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="rounded-xl border-2 focus:border-blue-500"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
              <textarea
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none resize-none"
                rows={3}
                placeholder="Enter your complete address"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                <Input
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="rounded-xl border-2 focus:border-blue-500"
                  placeholder="Enter city"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">State</label>
                <Input
                  required
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="rounded-xl border-2 focus:border-blue-500"
                  placeholder="Enter state"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Pincode</label>
                <Input
                  required
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  className="rounded-xl border-2 focus:border-blue-500"
                  placeholder="Enter pincode"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowNewAddressForm(false)}
                className="flex-1 rounded-xl border-2"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl"
              >
                Use This Address
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
