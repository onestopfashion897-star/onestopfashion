"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  CheckCircle, 
  Package, 
  Truck, 
  Home, 
  ShoppingBag, 
  Download,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Heart,
  Star,
  Share2,
  CreditCard,
  Calendar,
  Clock
} from 'lucide-react'
import { Navbar } from '@/components/ui/navbar'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'

interface OrderItem {
  productId: string
  name: string
  price: number
  offerPrice?: number
  quantity: number
  size: string
  image: string
}

interface Order {
  _id: string
  orderId: string
  userId: string
  items: OrderItem[]
  shippingAddress: {
    name: string
    phone: string
    address: string
    city: string
    state: string
    pincode: string
  }
  paymentMethod: string
  subtotal: number
  shippingCost: number
  discount: number
  total: number
  orderStatus: string
  paymentStatus: string
  createdAt: string
  estimatedDelivery: string
}

export default function OrderConfirmationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const { toast } = useToast()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const orderId = searchParams.get('orderId')
    if (!orderId) {
      router.push('/')
      return
    }

    fetchOrder(orderId)
  }, [searchParams, router])

  const fetchOrder = async (orderId: string) => {
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`/api/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      })
      const data = await response.json()

      if (data.success) {
        setOrder(data.data)
      } else {
        console.error('Failed to fetch order:', data.error)
      }
    } catch (error) {
      console.error('Error fetching order:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'shipped':
        return 'bg-purple-100 text-purple-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const downloadInvoice = async () => {
    try {
      const orderId = searchParams.get('orderId')
      if (!orderId) return
      
      // Show loading toast
      toast({
        title: "Generating Invoice",
        description: "Please wait while we generate your invoice...",
      })
      
      const response = await fetch(`/api/orders/${orderId}/invoice`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = `invoice-${order?.orderId || orderId}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        toast({
          title: "Invoice Downloaded",
          description: "Your invoice has been downloaded successfully!",
        })
      } else {
        // Try to get detailed error message from response
        const errorData = await response.json().catch(() => null)
        const errorMessage = errorData?.error || 'Failed to download invoice'
        throw new Error(errorMessage)
      }
    } catch (error) {
      console.error('Error downloading invoice:', error)
      toast({
        title: "Invoice Download Failed",
        description: error instanceof Error ? error.message : "Unable to download invoice. Please try again later.",
        variant: "destructive",
      })
    }
  }

  const sendConfirmationEmail = async () => {
    try {
      const orderId = searchParams.get('orderId')
      if (!orderId) return
      
      const response = await fetch(`/api/orders/${orderId}/send-confirmation`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        toast({
          title: "Email Sent",
          description: "Order confirmation email has been sent to your email address!",
        })
      } else {
        throw new Error('Failed to send email')
      }
    } catch (error) {
      console.error('Error sending confirmation email:', error)
      toast({
        title: "Email Failed",
        description: "Unable to send confirmation email. Please try again later.",
        variant: "destructive",
      })
    }
  }

  const trackOrder = () => {
    // Redirect to order tracking page
    window.open(`/track-order?orderId=${order?.orderId}`, '_blank')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Navbar />
        <div className="container mx-auto px-4 py-16 pt-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading your order...</h2>
            <p className="text-gray-600">Please wait while we fetch your order details.</p>
          </div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Navbar />
        <div className="container mx-auto px-4 py-16 pt-20">
          <div className="text-center">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-12 h-12 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Order not found</h2>
            <p className="text-gray-600 mb-8">The order you're looking for doesn't exist or you don't have permission to view it.</p>
            <Link href="/">
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                <Home className="w-4 h-4 mr-2" />
                Go to Home
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
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Thank you for your order!
          </h1>
          <p className="text-xl text-gray-600 mb-6 max-w-2xl mx-auto">
            Your order has been successfully placed and is being processed. 
            We'll send you a confirmation email shortly with all the details.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Badge className="bg-green-100 text-green-800 px-4 py-2 text-lg font-semibold">
              Order ID: {order?.orderId}
            </Badge>

          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-3xl">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
                  <Package className="w-6 h-6 mr-3 text-blue-600" />
                  Order Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <div>
                    <p className="text-sm text-gray-600">Order Status</p>
                    <Badge className={`mt-1 ${getStatusColor(order.orderStatus)}`}>
                      {order.orderStatus}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payment Status</p>
                    <Badge className={`mt-1 ${getPaymentStatusColor(order.paymentStatus)}`}>
                      {order.paymentStatus}
                    </Badge>
                  </div>
                </div>

                {/* Order Timeline */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Order Timeline</h4>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Order Placed</p>
                        <p className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <Package className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Processing</p>
                        <p className="text-sm text-gray-600">Your order is being prepared</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <Truck className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-400">Shipped</p>
                        <p className="text-sm text-gray-400">Estimated delivery: {order.estimatedDelivery}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-3xl">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl font-bold text-gray-900">Order Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index}>
                    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-2xl">
                      <div className="relative w-20 h-20 overflow-hidden rounded-xl">
                        <Image
                          src={item.image || '/placeholder.jpg'}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-600">Size: {item.size} • Qty: {item.quantity}</p>
                        <p className="text-sm text-gray-600">
                          ₹{(item.offerPrice || item.price).toLocaleString()} each
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          ₹{((item.offerPrice || item.price) * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {index < order.items.length - 1 && <Separator className="my-4" />}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-3xl">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
                  <MapPin className="w-6 h-6 mr-3 text-blue-600" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <p className="font-semibold text-gray-900">{order.shippingAddress.name}</p>
                  <p className="text-gray-600">{order.shippingAddress.address}</p>
                  <p className="text-gray-600">
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}
                  </p>
                  <p className="text-gray-600 mt-2">
                    <Phone className="w-4 h-4 inline mr-2" />
                    {order.shippingAddress.phone}
                  </p>
                </div>
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
                {/* Price Breakdown */}
                <div className="space-y-4">
                  <div className="flex justify-between text-lg">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">₹{order.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-lg">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-semibold">{order.shippingCost === 0 ? 'Free' : `₹${order.shippingCost}`}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-lg text-green-600">
                      <span>Discount</span>
                      <span className="font-semibold">-₹{order.discount.toLocaleString()}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-2xl font-bold text-gray-900">
                    <span>Total</span>
                    <span>₹{order.total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <h4 className="font-semibold text-gray-900 mb-2">Payment Method</h4>
                  <p className="text-gray-600 capitalize">{order.paymentMethod}</p>
                </div>

                {/* Estimated Delivery */}
                <div className="p-4 bg-blue-50 rounded-2xl">
                  <h4 className="font-semibold text-blue-900 mb-2">Estimated Delivery</h4>
                  <p className="text-blue-700">{order.estimatedDelivery}</p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4">
                  <Button
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300"
                    onClick={downloadInvoice}
                  >
                    <Download className="w-5 h-5 mr-3" />
                    Download Invoice
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full border-2 border-green-200 hover:border-green-300 hover:bg-green-50 rounded-2xl py-4 font-semibold transition-all duration-300"
                    onClick={sendConfirmationEmail}
                  >
                    <Mail className="w-5 h-5 mr-3" />
                    Send Confirmation Email
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full border-2 border-purple-200 hover:border-purple-300 hover:bg-purple-50 rounded-2xl py-4 font-semibold transition-all duration-300"
                    onClick={trackOrder}
                  >
                    <ExternalLink className="w-5 h-5 mr-3" />
                    Track Your Order
                  </Button>
                  
                  <Link href="/products">
                    <Button
                      variant="outline"
                      className="w-full border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 rounded-2xl py-4 font-semibold transition-all duration-300"
                    >
                      <ShoppingBag className="w-5 h-5 mr-3" />
                      Continue Shopping
                    </Button>
                  </Link>

                  <Link href="/account/orders">
                    <Button
                      variant="outline"
                      className="w-full border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50 rounded-2xl py-4 font-semibold transition-all duration-300"
                    >
                      <Package className="w-5 h-5 mr-3" />
                      View All Orders
                    </Button>
                  </Link>
                </div>

                {/* Support */}
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <h4 className="font-semibold text-gray-900 mb-3">Need Help?</h4>
                  <div className="space-y-2 text-sm">
                    <p className="flex items-center text-gray-600">
                      <Mail className="w-4 h-4 mr-2" />
                      support@happyfeet.com
                    </p>
                    <p className="flex items-center text-gray-600">
                      <Phone className="w-4 h-4 mr-2" />
                      +91 98765 43210
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
