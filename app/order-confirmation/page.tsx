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
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16 pt-24 text-center">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16 pt-24 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Order not found</h2>
          <Link href="/">
            <Button className="bg-black hover:bg-gray-800 rounded-full">Go to Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-16 pt-24">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Order Confirmed!</h1>
          <p className="text-gray-600 mb-4">Order ID: <span className="font-semibold">{order?.orderId}</span></p>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Expected Delivery</p>
                <p className="font-semibold text-gray-900">{order.estimatedDelivery}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Payment Method</p>
                <p className="font-semibold text-gray-900 capitalize">{order.paymentMethod}</p>
              </div>
            </div>
          </div>

          <div className="border rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Order Items</h3>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                    <Image src={item.image || '/placeholder.jpg'} alt={item.name} fill className="object-cover" sizes="64px" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                    <p className="text-sm text-gray-600">Size: {item.size} • Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-gray-900">₹{((item.offerPrice || item.price) * item.quantity).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="border rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Delivery Address</h3>
            <div className="text-gray-600">
              <p className="font-medium text-gray-900">{order.shippingAddress.name}</p>
              <p>{order.shippingAddress.address}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}</p>
              <p className="mt-2">{order.shippingAddress.phone}</p>
            </div>
          </div>

          <div className="border rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">₹{order.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">{order.shippingCost === 0 ? 'Free' : `₹${order.shippingCost}`}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span className="font-medium">-₹{order.discount.toLocaleString()}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>₹{order.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Link href="/products" className="flex-1">
              <Button variant="outline" className="w-full rounded-full">Continue Shopping</Button>
            </Link>
            <Link href="/account/orders" className="flex-1">
              <Button className="w-full bg-black hover:bg-gray-800 rounded-full">View Orders</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
