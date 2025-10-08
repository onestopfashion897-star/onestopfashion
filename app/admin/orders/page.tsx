"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Search, 
  Filter, 
  Eye, 
  Package, 
  Truck, 
  CheckCircle, 
  XCircle, 
  Clock,
  Loader2,
  Download,
  RefreshCw
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useAdminAuth } from '@/contexts/AdminAuthContext'

interface Order {
  _id: string
  orderId: string
  userId: string
  items: Array<{
    productId: string
    name: string
    price: number
    offerPrice?: number
    quantity: number
    size: string
    image: string
    variantId?: string
    variantName?: string
    variantType?: 'color' | 'model'
  }>
  shippingAddress: {
    name: string
    phone: string
    address: string
    city: string
    state: string
    pincode: string
  }
  paymentMethod: string
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded'
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  subtotal: number
  discount: number
  shipping: number
  total: number
  couponCode?: string
  trackingNumber?: string
  estimatedDelivery?: string
  notes?: string
  createdAt: string
  updatedAt: string
  user?: {
    name: string
    email: string
    phone: string
  }
}

const orderStatuses = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-100 text-blue-800' },
  { value: 'processing', label: 'Processing', color: 'bg-purple-100 text-purple-800' },
  { value: 'shipped', label: 'Shipped', color: 'bg-orange-100 text-orange-800' },
  { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
]

const paymentStatuses = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
  { value: 'failed', label: 'Failed', color: 'bg-red-100 text-red-800' },
  { value: 'refunded', label: 'Refunded', color: 'bg-gray-100 text-gray-800' },
]

export default function OrdersPage() {
  const { toast } = useToast()
  const { admin } = useAdminAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [bulkAction, setBulkAction] = useState('')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/orders', {
        credentials: 'include' // Include cookies for admin authentication
      })
      const data = await response.json()
      
      if (data.success) {
        setOrders(data.data || [])
      } else {
        // Check for authentication errors and redirect to login
        if (response.status === 401 || response.status === 403 || 
            data.error === 'Admin access revoked' || 
            data.error === 'Invalid token' || 
            data.error === 'No token provided') {
          toast({
            title: "Session Expired",
            description: "Please log in again",
            variant: "destructive"
          })
          window.location.href = '/admin/login'
          return
        }
        
        console.error('Failed to fetch orders:', data.error)
        toast({
          title: "Error",
          description: data.error || "Failed to fetch orders",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingStatus(orderId)
      console.log('Updating order status:', { orderId, newStatus })
      
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Include cookies for admin authentication
        body: JSON.stringify({ status: newStatus })
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))

      // Check if response is ok
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Response not ok:', response.status, errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      // Try to parse JSON response
      let data
      try {
        const responseText = await response.text()
        console.log('Response text:', responseText)
        
        if (!responseText) {
          throw new Error('Empty response from server')
        }
        
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error('Error parsing JSON response:', parseError)
        throw new Error('Invalid JSON response from server')
      }

      if (data.success) {
        toast({
          title: "Success",
          description: "Order status updated successfully"
        })
        fetchOrders()
        if (selectedOrder?._id === orderId) {
          // Ensure we only update with valid string values, not objects
          const validStatus = typeof newStatus === 'string' ? newStatus as Order['orderStatus'] : selectedOrder.orderStatus
          setSelectedOrder({ ...selectedOrder, orderStatus: validStatus })
        }
      } else {
        // Check for authentication errors and redirect to login
        if (response.status === 401 || response.status === 403 || 
            data.error === 'Admin access revoked' || 
            data.error === 'Invalid token' || 
            data.error === 'No token provided') {
          toast({
            title: "Session Expired",
            description: "Please log in again",
            variant: "destructive"
          })
          window.location.href = '/admin/login'
          return
        }
        
        toast({
          title: "Error",
          description: data.error || "Failed to update order status",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error updating order status:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update order status",
        variant: "destructive"
      })
    } finally {
      setUpdatingStatus(null)
    }
  }

  const updateTrackingNumber = async (orderId: string, trackingNumber: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/tracking`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ trackingNumber })
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Tracking number updated successfully"
        })
        fetchOrders()
        if (selectedOrder?._id === orderId) {
          // Ensure we only update with valid string values
          const validTrackingNumber = typeof trackingNumber === 'string' ? trackingNumber : selectedOrder.trackingNumber || ''
          setSelectedOrder({ ...selectedOrder, trackingNumber: validTrackingNumber })
        }
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update tracking number",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error updating tracking number:', error)
      toast({
        title: "Error",
        description: "Failed to update tracking number",
        variant: "destructive"
      })
    }
  }

  const updateOrderNotes = async (orderId: string, notes: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/notes`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ notes })
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Order notes updated successfully"
        })
        fetchOrders()
        if (selectedOrder?._id === orderId) {
          // Ensure we only update with valid string values
          const validNotes = typeof notes === 'string' ? notes : selectedOrder.notes || ''
          setSelectedOrder({ ...selectedOrder, notes: validNotes })
        }
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update order notes",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error updating order notes:', error)
      toast({
        title: "Error",
        description: "Failed to update order notes",
        variant: "destructive"
      })
    }
  }

  const handleBulkAction = async () => {
    if (!bulkAction || selectedOrders.length === 0) return

    try {
      for (const orderId of selectedOrders) {
        await updateOrderStatus(orderId, bulkAction)
      }
      
      setSelectedOrders([])
      setBulkAction('')
      
      toast({
        title: "Success",
        description: `Updated ${selectedOrders.length} orders successfully.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update some orders.",
        variant: "destructive",
      })
    }
  }

  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    )
  }

  const toggleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([])
    } else {
      setSelectedOrders(filteredOrders.map(order => order._id))
    }
  }

  const exportOrders = () => {
    const csvContent = [
      ['Order ID', 'Customer', 'Items', 'Total', 'Status', 'Payment Status', 'Date'].join(','),
      ...filteredOrders.map(order => [
        order.orderId,
        order.user?.name || 'N/A',
        order.items.length,
        `₹${order.total}`,
        order.orderStatus,
        order.paymentStatus,
        new Date(order.createdAt).toLocaleDateString()
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getStatusColor = (status: any, type: 'order' | 'payment') => {
    // Normalize to a string in case an object was accidentally passed (e.g., { orderStatus, updatedAt })
    const normalized = typeof status === 'string'
      ? status
      : (status?.orderStatus && typeof status.orderStatus === 'string')
        ? status.orderStatus
        : ''

    const statusList = type === 'order' ? orderStatuses : paymentStatuses
    const statusObj = statusList.find(s => s.value === normalized)
    return statusObj?.color || 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (status: any, type: 'order' | 'payment') => {
    // Normalize to a string in case an object was accidentally passed (e.g., { orderStatus, updatedAt })
    const normalized = typeof status === 'string'
      ? status
      : (status?.orderStatus && typeof status.orderStatus === 'string')
        ? status.orderStatus
        : ''

    const statusList = type === 'order' ? orderStatuses : paymentStatuses
    const statusObj = statusList.find(s => s.value === normalized)
    return statusObj?.label || (normalized || 'Unknown')
  }

  const filteredOrders = orders.filter(order => {
    // Safety checks to prevent runtime errors
    if (!order || !order.orderId || !order.shippingAddress || !order.items) {
      return false
    }
    
    const searchLower = searchQuery.toLowerCase()
    const matchesSearch = 
      order.orderId.toLowerCase().includes(searchLower) ||
      (order.shippingAddress.name || '').toLowerCase().includes(searchLower) ||
      (order.shippingAddress.phone || '').includes(searchQuery) ||
      order.items.some(item => item && item.name && item.name.toLowerCase().includes(searchLower))
    
    const matchesStatus = statusFilter === 'all' || !statusFilter || order.orderStatus === statusFilter
    const matchesPayment = paymentFilter === 'all' || !paymentFilter || order.paymentStatus === paymentFilter
    
    return matchesSearch && matchesStatus && matchesPayment
  })

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.orderStatus === 'pending').length,
    processing: orders.filter(o => o.orderStatus === 'processing').length,
    shipped: orders.filter(o => o.orderStatus === 'shipped').length,
    delivered: orders.filter(o => o.orderStatus === 'delivered').length,
    cancelled: orders.filter(o => o.orderStatus === 'cancelled').length,
    totalRevenue: orders.reduce((sum, order) => sum + order.total, 0)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm sm:text-base text-gray-600">Manage customer orders and track shipments</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => { setLoading(true); fetchOrders(); }} disabled={loading} className="w-full sm:w-auto">
             <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
             Refresh
           </Button>
          <Button variant="outline" onClick={exportOrders} className="w-full sm:w-auto">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="text-lg sm:text-2xl font-bold">{stats.total}</div>
            <div className="text-xs sm:text-sm text-gray-600">Total Orders</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="text-lg sm:text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-xs sm:text-sm text-gray-600">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="text-lg sm:text-2xl font-bold text-purple-600">{stats.processing}</div>
            <div className="text-xs sm:text-sm text-gray-600">Processing</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="text-lg sm:text-2xl font-bold text-orange-600">{stats.shipped}</div>
            <div className="text-xs sm:text-sm text-gray-600">Shipped</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="text-lg sm:text-2xl font-bold text-green-600">{stats.delivered}</div>
            <div className="text-xs sm:text-sm text-gray-600">Delivered</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="text-lg sm:text-2xl font-bold text-red-600">{stats.cancelled}</div>
            <div className="text-xs sm:text-sm text-gray-600">Cancelled</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="text-lg sm:text-2xl font-bold text-blue-600">₹{stats.totalRevenue.toLocaleString()}</div>
            <div className="text-xs sm:text-sm text-gray-600">Total Revenue</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg sm:text-xl">
            <Filter className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Search & Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-sm sm:text-base"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="text-sm sm:text-base">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {orderStatuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="text-sm sm:text-base">
                <SelectValue placeholder="All Payment Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payment Statuses</SelectItem>
                {paymentStatuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedOrders.length > 0 && (
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <span className="text-xs sm:text-sm font-medium">
                  {selectedOrders.length} order{selectedOrders.length > 1 ? 's' : ''} selected
                </span>
                <Select value={bulkAction} onValueChange={setBulkAction}>
                  <SelectTrigger className="w-full sm:w-48 text-sm">
                    <SelectValue placeholder="Select action" />
                  </SelectTrigger>
                  <SelectContent>
                    {orderStatuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        Update to {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  onClick={handleBulkAction}
                  disabled={!bulkAction}
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  Apply
                </Button>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedOrders([])}
                className="w-full sm:w-auto"
              >
                Clear Selection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">All Orders ({filteredOrders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin mr-2" />
              <span className="text-sm sm:text-base">Loading orders...</span>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <input
                          type="checkbox"
                          checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                          onChange={toggleSelectAll}
                          className="rounded"
                        />
                      </TableHead>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Order Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                          No orders found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredOrders.map((order) => (
                        <TableRow key={order._id}>
                          <TableCell>
                            <input
                              type="checkbox"
                              checked={selectedOrders.includes(order._id)}
                              onChange={() => toggleOrderSelection(order._id)}
                              className="rounded"
                            />
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{order.orderId}</div>
                            <div className="text-sm text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{order.shippingAddress.name}</div>
                              {order.user?.email && <div className="text-sm text-gray-500">{order.user.email}</div>}
                              <div className="text-sm text-gray-500">{order.shippingAddress.phone}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {order.items.slice(0, 2).map((item, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                  <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                                    {item.image ? (
                                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                    ) : (
                                      <Package className="w-4 h-4 text-gray-400" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium truncate">{item.name}</div>
                                    <div className="text-xs text-gray-500">
                                      Qty: {item.quantity} • Size: {item.size}
                                      {item.variantName && (
                                        <span className="ml-1">
                                          • {item.variantType === 'color' ? 'Color' : 'Model'}: {item.variantName}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                              {order.items.length > 2 && (
                                <div className="text-xs text-gray-500 pl-10">
                                  +{order.items.length - 2} more items
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">₹{order.total}</div>
                            {order.discount > 0 && (
                              <div className="text-sm text-green-600">-₹{order.discount} off</div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(order.orderStatus, 'order')}>
                              {getStatusLabel(order.orderStatus, 'order')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(order.paymentStatus, 'payment')}>
                              {getStatusLabel(order.paymentStatus, 'payment')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedOrder(order)
                                  setIsDetailsOpen(true)
                                }}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {filteredOrders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No orders found
                  </div>
                ) : (
                  filteredOrders.map((order) => (
                    <Card key={order._id} className="p-3">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={selectedOrders.includes(order._id)}
                            onChange={() => toggleOrderSelection(order._id)}
                            className="rounded"
                          />
                          <div>
                            <div className="font-medium text-sm">{order.orderId}</div>
                            <div className="text-xs text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedOrder(order)
                            setIsDetailsOpen(true)
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <div className="text-xs text-gray-500 uppercase tracking-wide">Customer</div>
                          <div className="text-sm font-medium">{order.shippingAddress.name}</div>
                          {order.user?.email && <div className="text-xs text-gray-500">{order.user.email}</div>}
                          <div className="text-xs text-gray-500">{order.shippingAddress.phone}</div>
                        </div>
                        
                        <div>
                          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Items</div>
                          <div className="space-y-1">
                            {order.items.slice(0, 2).map((item, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                                  {item.image ? (
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <Package className="w-3 h-3 text-gray-400" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-medium truncate">{item.name}</div>
                                  <div className="text-xs text-gray-500">Qty: {item.quantity} • Size: {item.size}</div>
                                </div>
                              </div>
                            ))}
                            {order.items.length > 2 && (
                              <div className="text-xs text-gray-500 pl-8">
                                +{order.items.length - 2} more items
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center pt-2 border-t">
                          <div>
                            <div className="text-xs text-gray-500 uppercase tracking-wide">Total</div>
                            <div className="text-sm font-medium">₹{order.total}</div>
                            {order.discount > 0 && (
                              <div className="text-xs text-green-600">-₹{order.discount} off</div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="space-y-1">
                              <Badge className={`${getStatusColor(order.orderStatus, 'order')} text-xs`}>
                                {getStatusLabel(order.orderStatus, 'order')}
                              </Badge>
                              <Badge className={`${getStatusColor(order.paymentStatus, 'payment')} text-xs`}>
                                {getStatusLabel(order.paymentStatus, 'payment')}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Order Details - {selectedOrder?.orderId}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 text-xs sm:text-sm">
                <TabsTrigger value="details" className="text-xs sm:text-sm">Details</TabsTrigger>
                <TabsTrigger value="items" className="text-xs sm:text-sm">Items</TabsTrigger>
                <TabsTrigger value="shipping" className="text-xs sm:text-sm">Shipping</TabsTrigger>
                <TabsTrigger value="actions" className="text-xs sm:text-sm">Actions</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2 text-sm sm:text-base">Order Information</h3>
                    <div className="space-y-2 text-xs sm:text-sm">
                      <div><span className="font-medium">Order ID:</span> {selectedOrder.orderId}</div>
                      <div><span className="font-medium">Date:</span> {new Date(selectedOrder.createdAt).toLocaleString()}</div>
                      <div><span className="font-medium">Payment Method:</span> {selectedOrder.paymentMethod}</div>
                      <div><span className="font-medium">Coupon:</span> {selectedOrder.couponCode || 'None'}</div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 text-sm sm:text-base">Pricing</h3>
                    <div className="space-y-2 text-xs sm:text-sm">
                      <div><span className="font-medium">Subtotal:</span> ₹{selectedOrder.subtotal}</div>
                      <div><span className="font-medium">Discount:</span> ₹{selectedOrder.discount}</div>
                      <div><span className="font-medium">Shipping:</span> ₹{selectedOrder.shipping}</div>
                      <div><span className="font-medium">Total:</span> ₹{selectedOrder.total}</div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="items" className="space-y-3 sm:space-y-4">
                <div className="space-y-3 sm:space-y-4">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 border rounded-lg">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <Package className="w-4 h-4 sm:w-6 sm:h-6 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm sm:text-base">{item.name}</div>
                        <div className="text-xs sm:text-sm text-gray-500">Size: {item.size}</div>
                        <div className="text-xs sm:text-sm text-gray-500">Qty: {item.quantity}</div>
                        {item.variantName && (
                          <div className="text-xs sm:text-sm text-gray-500">
                            {item.variantType === 'color' ? 'Color' : 'Model'}: {item.variantName}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-sm sm:text-base">₹{item.offerPrice || item.price}</div>
                        <div className="text-xs sm:text-sm text-gray-500">Total: ₹{(item.offerPrice || item.price) * item.quantity}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="shipping" className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Shipping Address</h3>
                  <div className="p-4 border rounded-lg space-y-2 text-sm">
                    <div><span className="font-medium">Name:</span> {selectedOrder.shippingAddress.name}</div>
                    {selectedOrder.user?.email && <div><span className="font-medium">Email:</span> {selectedOrder.user.email}</div>}
                    <div><span className="font-medium">Phone:</span> {selectedOrder.shippingAddress.phone}</div>
                    <div><span className="font-medium">Address:</span> {selectedOrder.shippingAddress.address}</div>
                    <div><span className="font-medium">City:</span> {selectedOrder.shippingAddress.city}</div>
                    <div><span className="font-medium">State:</span> {selectedOrder.shippingAddress.state}</div>
                    <div><span className="font-medium">Pincode:</span> {selectedOrder.shippingAddress.pincode}</div>
                  </div>
                </div>
                {selectedOrder.trackingNumber && (
                  <div>
                    <h3 className="font-semibold mb-2">Tracking Information</h3>
                    <div className="p-4 border rounded-lg space-y-2 text-sm">
                      <div><span className="font-medium">Tracking Number:</span> {selectedOrder.trackingNumber}</div>
                      {selectedOrder.estimatedDelivery && (
                        <div><span className="font-medium">Estimated Delivery:</span> {selectedOrder.estimatedDelivery}</div>
                      )}
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="actions" className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-4">Update Order Status</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {orderStatuses.map((status) => (
                      <Button
                        key={status.value}
                        variant={selectedOrder.orderStatus === status.value ? "default" : "outline"}
                        onClick={() => updateOrderStatus(selectedOrder._id, status.value)}
                        disabled={updatingStatus === selectedOrder._id}
                        className="justify-start"
                      >
                        {updatingStatus === selectedOrder._id && selectedOrder.orderStatus === status.value ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4 mr-2" />
                        )}
                        {status.label}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-4">Tracking Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Tracking Number</label>
                      <div className="flex space-x-2 mt-1">
                        <Input 
                          placeholder="Enter tracking number"
                          defaultValue={selectedOrder.trackingNumber || ''}
                          id="tracking-input"
                        />
                        <Button 
                          size="sm"
                          onClick={() => {
                            const input = document.getElementById('tracking-input') as HTMLInputElement
                            if (input?.value) {
                              updateTrackingNumber(selectedOrder._id, input.value)
                            }
                          }}
                        >
                          Update
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Order Notes</label>
                      <div className="flex space-x-2 mt-1">
                        <Input 
                          placeholder="Add internal notes"
                          defaultValue={selectedOrder.notes || ''}
                          id="notes-input"
                        />
                        <Button 
                          size="sm"
                          onClick={() => {
                            const input = document.getElementById('notes-input') as HTMLInputElement
                            if (input?.value !== undefined) {
                              updateOrderNotes(selectedOrder._id, input.value)
                            }
                          }}
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
