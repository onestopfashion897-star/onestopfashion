"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Search, Package, Eye, Download, RotateCcw, MessageCircle, Loader2, AlertCircle, RefreshCw, Star } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { Order } from "@/lib/types"
import { ReviewModal } from "@/components/ReviewModal"

// Types for better type safety
interface OrdersState {
  orders: Order[]
  loading: boolean
  error: string | null
}

interface FilterState {
  searchTerm: string
  statusFilter: string
}

// Constants
const ORDER_STATUSES = {
  all: "All Orders",
  pending: "Pending",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled"
} as const

const STATUS_COLORS = {
  delivered: "bg-green-100 text-green-800 border-green-200",
  shipped: "bg-blue-100 text-blue-800 border-blue-200",
  processing: "bg-yellow-100 text-yellow-800 border-yellow-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
  pending: "bg-gray-100 text-gray-800 border-gray-200"
} as const

// Custom hooks
const useOrdersData = () => {
  const [state, setState] = useState<OrdersState>({
    orders: [],
    loading: true,
    error: null
  })
  const { toast } = useToast()

  const fetchOrders = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        throw new Error('Authentication required')
      }

      const response = await fetch('/api/orders/my-orders', {
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
          orders: data.data || [],
          loading: false,
          error: null
        })
      } else {
        throw new Error(data.error || 'Failed to fetch orders')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch orders'
      setState({
        orders: [],
        loading: false,
        error: errorMessage
      })
      
      if (errorMessage === 'Authentication required') {
        toast({
          title: "Authentication Required",
          description: "Please log in to view your orders.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      }
    }
  }, [toast])

  return { ...state, fetchOrders }
}

const useOrderFilters = (orders: Order[]) => {
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: "",
    statusFilter: "all"
  })

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.orderId.toLowerCase().includes(filters.searchTerm.toLowerCase())
    // Hide cancelled orders by default unless specifically filtering for them
    const matchesStatus = filters.statusFilter === "all" 
      ? order.orderStatus !== 'cancelled' 
      : order.orderStatus === filters.statusFilter
    return matchesSearch && matchesStatus
  })

  return {
    filters,
    setFilters,
    filteredOrders,
    updateSearchTerm: (searchTerm: string) => setFilters(prev => ({ ...prev, searchTerm })),
    updateStatusFilter: (statusFilter: string) => setFilters(prev => ({ ...prev, statusFilter }))
  }
}

// Components
const OrderStatusBadge = ({ status }: { status: string }) => {
  const colorClass = STATUS_COLORS[status as keyof typeof STATUS_COLORS] || STATUS_COLORS.pending
  
  return (
    <Badge className={`${colorClass} font-medium`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}

const OrderItem = ({ item, index }: { item: any, index: number }) => (
  <div key={`${item.productId}-${item.size}-${index}`} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
    <div className="relative w-16 h-16 overflow-hidden rounded-lg bg-white">
      <Image
        src={item.image || "/placeholder.svg"}
        alt={item.name || 'Product image'}
        fill
        className="object-cover"
        sizes="64px"
      />
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="font-medium text-gray-900 truncate">{item.name}</h4>
      <p className="text-sm text-gray-600">
        Size: {item.size} • Qty: {item.quantity}
      </p>
    </div>
    <div className="text-right">
      <span className="font-medium text-gray-900">
        Rs.{(item.price * item.quantity).toLocaleString()}
      </span>
    </div>
  </div>
)

const OrderActions = ({ order, onDownloadInvoice, onWriteReview }: { 
  order: Order, 
  onDownloadInvoice: (order: Order) => void,
  onWriteReview: (order: Order, item: any) => void 
}) => (
  <div className="flex flex-wrap gap-2">
    <Link href={`/account/orders/${order._id}`}>
      <Button variant="outline" size="sm" className="bg-white hover:bg-gray-50">
        <Eye className="w-4 h-4 mr-2" />
        View Details
      </Button>
    </Link>

    {order.orderStatus === "delivered" && (
      <>
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-white hover:bg-gray-50"
          onClick={() => onDownloadInvoice(order)}
        >
          <Download className="w-4 h-4 mr-2" />
          Invoice
        </Button>
        
        {order.items.map((item, index) => (
          <Button 
            key={`review-${item.productId}-${index}`}
            variant="outline" 
            size="sm" 
            className="bg-white hover:bg-gray-50"
            onClick={() => onWriteReview(order, item)}
          >
            <Star className="w-4 h-4 mr-2" />
            Review {item.name}
          </Button>
        ))}
      </>
    )}

    {order.orderStatus === "shipped" && (
      <Link href={`/track-order/${order.orderId}`}>
        <Button variant="outline" size="sm" className="bg-white hover:bg-gray-50">
          <Package className="w-4 h-4 mr-2" />
          Track
        </Button>
      </Link>
    )}

    <Link href="https://wa.me/919173803878

 " target="_blank" rel="noopener noreferrer">
      <Button variant="outline" size="sm" className="bg-white hover:bg-gray-50">
        <MessageCircle className="w-4 h-4 mr-2" />
        Support
      </Button>
    </Link>
  </div>
)

const OrderCard = ({ order, onDownloadInvoice, onWriteReview }: { 
  order: Order, 
  onDownloadInvoice: (order: Order) => void,
  onWriteReview: (order: Order, item: any) => void 
}) => (
  <Card key={order._id?.toString()} className="hover:shadow-md transition-shadow">
    <CardHeader className="pb-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <CardTitle className="text-lg text-gray-900">Order {order.orderId}</CardTitle>
          <p className="text-gray-600 text-sm">
            Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <OrderStatusBadge status={order.orderStatus} />
          <span className="font-bold text-lg text-gray-900">
            Rs.{order.total.toLocaleString()}
          </span>
        </div>
      </div>
    </CardHeader>

    <CardContent className="space-y-4">
      <div className="space-y-3">
        {order.items.map((item, index) => (
          <OrderItem key={`${item.productId}-${item.size}-${index}`} item={item} index={index} />
        ))}
      </div>

      <Separator />

      <OrderActions order={order} onDownloadInvoice={onDownloadInvoice} onWriteReview={onWriteReview} />
    </CardContent>
  </Card>
)

const LoadingState = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center">
      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
      <p className="text-gray-600">Loading your orders...</p>
    </div>
  </div>
)

const ErrorState = ({ error, onRetry }: { error: string, onRetry: () => void }) => (
  <Card>
    <CardContent className="pt-16 pb-16">
      <div className="text-center">
        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Something went wrong</h3>
        <p className="text-gray-600 mb-6">{error}</p>
        <Button onClick={onRetry} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    </CardContent>
  </Card>
)

const EmptyState = ({ hasFilters }: { hasFilters: boolean }) => (
  <Card>
    <CardContent className="pt-16 pb-16">
      <div className="text-center">
        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {hasFilters ? "No orders found" : "No orders yet"}
        </h3>
        <p className="text-gray-600 mb-6">
          {hasFilters
            ? "Try adjusting your search or filter criteria"
            : "You haven't placed any orders yet"}
        </p>
        {!hasFilters && (
          <Link href="/products">
            <Button>Start Shopping</Button>
          </Link>
        )}
      </div>
    </CardContent>
  </Card>
)

const FilterSection = ({ filters, updateSearchTerm, updateStatusFilter }: {
  filters: FilterState
  updateSearchTerm: (term: string) => void
  updateStatusFilter: (status: string) => void
}) => (
  <Card>
    <CardContent className="pt-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search orders by ID..."
            value={filters.searchTerm}
            onChange={(e) => updateSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filters.statusFilter} onValueChange={updateStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(ORDER_STATUSES).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </CardContent>
  </Card>
)

// Main component
export default function OrdersPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const { orders, loading, error, fetchOrders } = useOrdersData()
  const { filters, filteredOrders, updateSearchTerm, updateStatusFilter } = useOrderFilters(orders)
  const [selectedReviewItem, setSelectedReviewItem] = useState<{order: Order, item: any} | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const handleDownloadInvoice = async (order: Order) => {
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

  const handleWriteReview = async (order: Order, item: any) => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        toast({
          title: "Login Required",
          description: "Please sign in to write a review.",
          variant: "destructive",
        })
        return
      }

      const response = await fetch(`/api/reviews/verify-purchase?productId=${item.productId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        toast({
          title: "Error",
          description: data?.error || "Failed to verify purchase",
          variant: "destructive",
        })
        return
      }

      if (data?.canReview) {
        setSelectedReviewItem({ order, item })
      } else {
        toast({
          title: "Review Not Available",
          description: "You can only review products you have purchased and received.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error verifying purchase:', error)
      toast({
        title: "Error",
        description: "Failed to verify purchase for review",
        variant: "destructive",
      })
    }
  }

  const hasFilters = filters.searchTerm !== "" || filters.statusFilter !== "all"

  if (loading) {
    return <LoadingState />
  }

  if (error) {
    return <ErrorState error={error} onRetry={fetchOrders} />
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
        <p className="text-gray-600">Track and manage your orders</p>
      </div>

      {/* Filters */}
      <FilterSection 
        filters={filters}
        updateSearchTerm={updateSearchTerm}
        updateStatusFilter={updateStatusFilter}
      />

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <OrderCard key={order._id?.toString()} order={order} onDownloadInvoice={handleDownloadInvoice} onWriteReview={handleWriteReview} />
          ))
        ) : (
          <EmptyState hasFilters={hasFilters} />
        )}
      </div>

      {/* Review Modal */}
      {selectedReviewItem && (
        <ReviewModal
          isOpen={!!selectedReviewItem}
          onClose={() => setSelectedReviewItem(null)}
          order={selectedReviewItem.order}
          item={selectedReviewItem.item}
          onReviewSubmitted={() => {
            // Optionally refresh orders or show success message
            fetchOrders()
          }}
        />
      )}
    </div>
  )
}
