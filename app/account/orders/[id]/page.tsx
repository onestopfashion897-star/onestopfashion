"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Download, Package, Truck, CheckCircle, Clock, X, RotateCcw, MessageCircle, Loader2, AlertCircle, RefreshCw } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { Order } from "@/lib/types"

// Types
interface OrderDetailsState {
  order: Order | null
  loading: boolean
  error: string | null
}

// Constants
const STATUS_COLORS = {
  delivered: "bg-green-100 text-green-800 border-green-200",
  shipped: "bg-blue-100 text-blue-800 border-blue-200",
  processing: "bg-yellow-100 text-yellow-800 border-yellow-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
  pending: "bg-gray-100 text-gray-800 border-gray-200"
} as const

const STATUS_ICONS = {
  delivered: CheckCircle,
  shipped: Truck,
  processing: Clock,
  cancelled: X,
  pending: Package
} as const

// Custom hooks
const useOrderDetails = (orderId: string) => {
  const [state, setState] = useState<OrderDetailsState>({
    order: null,
    loading: true,
    error: null
  })
  const { toast } = useToast()
  const router = useRouter()

  const fetchOrderDetails = useCallback(async () => {
    if (!orderId) return
    
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        toast({
          title: "Authentication Required",
          description: "Please log in to view order details.",
          variant: "destructive",
        })
        router.push('/login')
        return
      }

      const response = await fetch(`/api/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setState({
          order: data.data,
          loading: false,
          error: null
        })
      } else {
        throw new Error(data.error || 'Failed to fetch order details')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch order details'
      setState({
        order: null,
        loading: false,
        error: errorMessage
      })
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }, [orderId, toast, router])

  return { ...state, fetchOrderDetails }
}

// Components
const OrderStatusBadge = ({ status }: { status: string }) => {
  const colorClass = STATUS_COLORS[status as keyof typeof STATUS_COLORS] || STATUS_COLORS.pending
  const IconComponent = STATUS_ICONS[status as keyof typeof STATUS_ICONS] || STATUS_ICONS.pending
  
  return (
    <Badge className={`${colorClass} font-medium flex items-center gap-2`}>
      <IconComponent className="w-4 h-4" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}

const OrderProgressTracker = ({ status }: { status: string }) => {
  const steps = [
    { key: 'pending', label: 'Order Placed', active: true },
    { key: 'processing', label: 'Processing', active: ['processing', 'shipped', 'delivered'].includes(status) },
    { key: 'shipped', label: 'Shipped', active: ['shipped', 'delivered'].includes(status) },
    { key: 'delivered', label: 'Delivered', active: status === 'delivered' }
  ]

  if (status === 'cancelled') {
    return (
      <div className="flex items-center justify-center p-4 bg-red-50 rounded-lg">
        <div className="flex items-center gap-2 text-red-600">
          <X className="w-5 h-5" />
          <span className="font-medium">Order Cancelled</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between text-sm">
      {steps.map((step, index) => (
        <div key={step.key} className="flex items-center">
          <div className={`flex items-center gap-2 ${step.active ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-3 h-3 rounded-full ${step.active ? 'bg-green-600' : 'bg-gray-300'}`}></div>
            <span className="font-medium">{step.label}</span>
          </div>
          {index < steps.length - 1 && (
            <div className={`w-8 h-0.5 mx-2 ${step.active && steps[index + 1].active ? 'bg-green-600' : 'bg-gray-300'}`}></div>
          )}
        </div>
      ))}
    </div>
  )
}

const OrderItem = ({ item, index }: { item: any, index: number }) => (
  <div key={`${item.productId}-${item.size}-${index}`} className="flex items-center gap-4 p-4 border rounded-lg bg-gray-50">
    <div className="relative w-16 h-16 overflow-hidden rounded-lg bg-white">
      <Image
        src={item.image || "/placeholder.svg"}
        alt={item.name || 'Product image'}
        fill
        className="object-cover"
        sizes="64px"
      />
    </div>
    <div className="flex-1">
      <h4 className="font-medium text-gray-900">{item.name}</h4>
      <p className="text-sm text-gray-600">
        Size: {item.size} • Qty: {item.quantity}
      </p>
    </div>
    <div className="text-right">
      <p className="font-medium">Rs.{(item.price * item.quantity).toLocaleString()}</p>
      <p className="text-sm text-gray-600">Rs.{item.price.toLocaleString()} each</p>
    </div>
  </div>
)

const ShippingAddress = ({ address }: { address: any }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg">Shipping Address</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-sm space-y-1">
        <p className="font-medium">{address.name}</p>
        <p>{address.address}</p>
        <p>{address.city}, {address.state} {address.pincode}</p>
        <p>{address.phone}</p>
      </div>
    </CardContent>
  </Card>
)

const OrderSummary = ({ order }: { order: Order }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg">Order Summary</CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      <div className="flex justify-between text-sm">
        <span>Subtotal</span>
        <span>Rs.{order.subtotal.toLocaleString()}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span>Shipping</span>
        <span>{order.shippingCost === 0 ? 'Free' : `Rs.${order.shippingCost.toLocaleString()}`}</span>
      </div>
      {order.discount > 0 && (
        <div className="flex justify-between text-sm text-green-600">
          <span>Discount</span>
          <span>-Rs.{order.discount.toLocaleString()}</span>
        </div>
      )}
      <Separator />
      <div className="flex justify-between font-medium text-lg">
        <span>Total</span>
        <span>Rs.{order.total.toLocaleString()}</span>
      </div>
      <div className="text-sm text-gray-600 space-y-1">
        <p>Payment Method: {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
        <p>Payment Status: <span className={`capitalize ${
          order.paymentStatus === 'paid' ? 'text-green-600' : 
          order.paymentStatus === 'failed' ? 'text-red-600' : 'text-yellow-600'
        }`}>{order.paymentStatus}</span></p>
      </div>
    </CardContent>
  </Card>
)

const OrderActions = ({ order, onDownloadInvoice }: { order: Order, onDownloadInvoice: () => void }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg">Actions</CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      {order.orderStatus === "delivered" && (
        <Button onClick={onDownloadInvoice} className="w-full" variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Download Invoice
        </Button>
      )}

      {order.orderStatus === "shipped" && (
        <Link href={`/track-order/${order.orderId}`}>
          <Button className="w-full" variant="outline">
            <Package className="w-4 h-4 mr-2" />
            Track Order
          </Button>
        </Link>
      )}

      <Button className="w-full" variant="outline">
        <MessageCircle className="w-4 h-4 mr-2" />
        Contact Support
      </Button>
    </CardContent>
  </Card>
)

const LoadingState = () => (
  <div className="min-h-screen bg-gray-50 py-8">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="animate-pulse space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-gray-200 rounded"></div>
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        </div>
        <div className="bg-white rounded-lg p-6 space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
)

const ErrorState = ({ error, onRetry }: { error: string, onRetry: () => void }) => (
  <div className="min-h-screen bg-gray-50 py-8">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <Card>
        <CardContent className="pt-16 pb-16">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Something went wrong</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex gap-4 justify-center">
              <Button onClick={onRetry} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Link href="/account/orders">
                <Button variant="default">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Orders
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
)

const NotFoundState = () => (
  <div className="min-h-screen bg-gray-50 py-8">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Order not found</h3>
        <p className="text-gray-600 mb-6">
          The order you're looking for doesn't exist or you don't have permission to view it.
        </p>
        <Link href="/account/orders">
          <Button>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </Button>
        </Link>
      </div>
    </div>
  </div>
)

// Main component
export default function OrderDetailsPage() {
  const params = useParams()
  const { user } = useAuth()
  const { toast } = useToast()
  const { order, loading, error, fetchOrderDetails } = useOrderDetails(params.id as string)

  useEffect(() => {
    fetchOrderDetails()
  }, [fetchOrderDetails])

  const handleDownloadInvoice = async () => {
    if (!order) return
    
    try {
      // Show loading toast
      toast({
        title: "Generating Invoice",
        description: "Please wait while we generate your invoice...",
      })
      
      const token = localStorage.getItem('authToken')
      const response = await fetch(`/api/orders/${order._id}/invoice`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = `invoice-${order.orderId}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        toast({
          title: "Success",
          description: "Invoice downloaded successfully",
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
        description: error instanceof Error ? error.message : "Failed to download invoice. Please try again later.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <LoadingState />
  }

  if (error) {
    return <ErrorState error={error} onRetry={fetchOrderDetails} />
  }

  if (!order) {
    return <NotFoundState />
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/account/orders">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
            <p className="text-gray-600">Order {order.orderId}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3">
                    Order Status
                    <OrderStatusBadge status={order.orderStatus} />
                  </CardTitle>
                  <div className="text-right">
                    <span className="text-sm text-gray-600">
                      Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <OrderProgressTracker status={order.orderStatus} />
                
                {/* Tracking Information */}
                {order.trackingNumber && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Truck className="w-5 h-5 text-blue-600" />
                      <h4 className="font-medium text-blue-900">Tracking Information</h4>
                    </div>
                    <p className="text-sm text-blue-800">
                      <span className="font-medium">Tracking Number:</span> {order.trackingNumber}
                    </p>
                  </div>
                )}
                
                {/* Order Notes */}
                {order.notes && (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageCircle className="w-5 h-5 text-gray-600" />
                      <h4 className="font-medium text-gray-900">Order Notes</h4>
                    </div>
                    <p className="text-sm text-gray-700">{order.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <OrderItem key={`${item.productId}-${item.size}-${index}`} item={item} index={index} />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <ShippingAddress address={order.shippingAddress} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <OrderSummary order={order} />
            <OrderActions order={order} onDownloadInvoice={handleDownloadInvoice} />
          </div>
        </div>
      </div>
    </div>
  )
}