"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShoppingCart, DollarSign, Package, Users, TrendingUp, AlertTriangle, Eye, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface DashboardStats {
  totalOrders: number
  totalRevenue: number
  totalProducts: number
  totalCustomers: number
  lowStockProducts: number
  recentOrders: any[]
}

interface SalesData {
  month: string
  revenue: number
  orders: number
}

export default function AdminDashboard() {
  const { toast } = useToast()
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalCustomers: 0,
    lowStockProducts: 0,
    recentOrders: []
  })
  const [salesData, setSalesData] = useState<SalesData[]>([])
  const [loading, setLoading] = useState(true)
  const [salesLoading, setSalesLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
    fetchSalesData()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      
      // Fetch orders (uses cookie authentication)
      const ordersResponse = await fetch('/api/orders', {
        credentials: 'include'
      })
      const ordersData = await ordersResponse.json()
      
      // Fetch products
      const productsResponse = await fetch('/api/products')
      const productsData = await productsResponse.json()
      
      // Fetch users (customers) (uses cookie authentication)
      const usersResponse = await fetch('/api/users', {
        credentials: 'include'
      })
      const usersData = await usersResponse.json()

      // Safe access to data arrays with fallbacks
      const orders = ordersData.success && Array.isArray(ordersData.data) ? ordersData.data : []
      const products = productsData.success && Array.isArray(productsData.data) ? productsData.data : []
      const users = usersData.success && Array.isArray(usersData.data) ? usersData.data : []

      const totalOrders = orders.length
      const totalRevenue = orders.reduce((sum: number, order: any) => sum + (order.total || 0), 0)
      const totalProducts = products.length
      const totalCustomers = users.length
      const lowStockProducts = products.filter((p: any) => p.stock && p.stock < 10).length
      const recentOrders = orders.slice(0, 5)

      setStats({
        totalOrders,
        totalRevenue,
        totalProducts,
        totalCustomers,
        lowStockProducts,
        recentOrders
      })
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      })
      
      // Set default stats on error
      setStats({
        totalOrders: 0,
        totalRevenue: 0,
        totalProducts: 0,
        totalCustomers: 0,
        lowStockProducts: 0,
        recentOrders: []
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchSalesData = async () => {
    try {
      setSalesLoading(true)
      const response = await fetch('/api/admin/analytics?timeRange=365', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setSalesData(data.monthlyRevenue || [])
      }
    } catch (error) {
      console.error('Error fetching sales data:', error)
    } finally {
      setSalesLoading(false)
    }
  }

  const handleRefresh = () => {
    fetchDashboardStats()
    fetchSalesData()
    toast({
      title: "Refreshed",
      description: "Dashboard data has been updated"
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Welcome to your admin dashboard</p>
          </div>
          <Button variant="outline" disabled>
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            Loading...
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600">Welcome to your admin dashboard</p>
        </div>
        <Button variant="outline" onClick={handleRefresh} className="w-full sm:w-auto">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-blue-600">{stats.lowStockProducts}</span> low stock
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+5%</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Sales Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Sales Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            {salesLoading ? (
              <div className="h-48 sm:h-64 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent mx-auto mb-2"></div>
                  <p className="text-gray-600 text-sm sm:text-base">Loading sales data...</p>
                </div>
              </div>
            ) : salesData.length > 0 ? (
              <div className="h-48 sm:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 10 }}
                      tickLine={{ stroke: '#6B7280' }}
                      interval="preserveStartEnd"
                    />
                    <YAxis 
                      tick={{ fontSize: 10 }}
                      tickLine={{ stroke: '#6B7280' }}
                      tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                      width={60}
                    />
                    <Tooltip 
                      formatter={(value: any, name: string) => [
                        name === 'revenue' ? `₹${value.toLocaleString()}` : value,
                        name === 'revenue' ? 'Revenue' : 'Orders'
                      ]}
                      labelStyle={{ color: '#374151' }}
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #E5E7EB', 
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#8B5CF6" 
                      strokeWidth={3}
                      dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#8B5CF6', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-48 sm:h-64 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                <div className="text-center px-4">
                  <TrendingUp className="w-8 h-8 sm:w-12 sm:h-12 text-purple-500 mx-auto mb-4" />
                  <p className="text-gray-600 text-sm sm:text-base">No sales data available</p>
                  <p className="text-xs sm:text-sm text-gray-500">Sales data will appear here once orders are placed</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <span className="text-base sm:text-lg">Recent Orders</span>
              <Button variant="ghost" size="sm" className="w-full sm:w-auto">
                View All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentOrders.length > 0 ? (
                stats.recentOrders.map((order: any) => (
                  <div key={order._id} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-xs sm:text-sm truncate">Order #{order.orderId}</p>
                        <p className="text-xs text-gray-500">₹{order.total}</p>
                      </div>
                    </div>
                    <Badge variant={order.status === 'paid' ? 'default' : 'secondary'} className="text-xs flex-shrink-0">
                      {order.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 sm:py-8">
                  <ShoppingCart className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-sm sm:text-base">No recent orders</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Button variant="outline" className="h-16 sm:h-20 flex flex-col text-xs sm:text-sm">
              <Package className="w-4 h-4 sm:w-6 sm:h-6 mb-1 sm:mb-2" />
              <span className="text-center leading-tight">Add Product</span>
            </Button>
            <Button variant="outline" className="h-16 sm:h-20 flex flex-col text-xs sm:text-sm">
              <ShoppingCart className="w-4 h-4 sm:w-6 sm:h-6 mb-1 sm:mb-2" />
              <span className="text-center leading-tight">View Orders</span>
            </Button>
            <Button variant="outline" className="h-16 sm:h-20 flex flex-col text-xs sm:text-sm">
              <Users className="w-4 h-4 sm:w-6 sm:h-6 mb-1 sm:mb-2" />
              <span className="text-center leading-tight">Manage Users</span>
            </Button>
            <Button variant="outline" className="h-16 sm:h-20 flex flex-col text-xs sm:text-sm">
              <TrendingUp className="w-4 h-4 sm:w-6 sm:h-6 mb-1 sm:mb-2" />
              <span className="text-center leading-tight">View Reports</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
