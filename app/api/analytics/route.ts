import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/models'
import { withAdminAuth } from '@/lib/auth'

interface Order {
  _id: string
  total?: number
  status?: string
  createdAt: string
  orderNumber?: string
  items?: Array<{
    productId?: any
    product?: { _id?: any; name?: string }
    name?: string
    quantity?: number
    price?: number
  }>
  shippingAddress?: { fullName?: string }
  user?: { name?: string }
}

export const GET = withAdminAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')
    
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    const previousStartDate = new Date()
    previousStartDate.setDate(previousStartDate.getDate() - (days * 2))
    previousStartDate.setHours(0, 0, 0, 0)
    
    const currentStartDate = new Date()
    currentStartDate.setDate(currentStartDate.getDate() - days)
    currentStartDate.setHours(0, 0, 0, 0)

    // Get current period orders
    const currentOrders = await DatabaseService.find('orders', {
      createdAt: { $gte: currentStartDate }
    }) as Order[]

    // Get previous period orders for comparison
    const previousOrders = await DatabaseService.find('orders', {
      createdAt: { 
        $gte: previousStartDate,
        $lt: currentStartDate
      }
    }) as Order[]

    // Calculate totals
    const totalRevenue = currentOrders.reduce((sum: number, order: Order) => sum + (order.total || 0), 0)
    const totalOrders = currentOrders.length
    const previousRevenue = previousOrders.reduce((sum: number, order: Order) => sum + (order.total || 0), 0)
    const previousOrderCount = previousOrders.length

    // Calculate growth percentages
    const revenueGrowth = previousRevenue > 0 
      ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 
      : 0
    const ordersGrowth = previousOrderCount > 0 
      ? ((totalOrders - previousOrderCount) / previousOrderCount) * 100 
      : 0

    // Get total products and users
    const totalProducts = await DatabaseService.count('products', { isActive: true })
    const totalUsers = await DatabaseService.count('users', {})

    // Get top selling products
    const productSales = new Map<string, { name: string; totalSold: number; revenue: number }>()
    currentOrders.forEach((order: Order) => {
      order.items?.forEach((item) => {
        const productId = item.productId?.toString() || item.product?._id?.toString()
        if (productId) {
          const existing = productSales.get(productId) || { 
            name: item.product?.name || item.name || 'Unknown Product',
            totalSold: 0, 
            revenue: 0 
          }
          existing.totalSold += item.quantity || 0
          existing.revenue += (item.price || 0) * (item.quantity || 0)
          productSales.set(productId, existing)
        }
      })
    })

    const topProducts = Array.from(productSales.entries())
      .map(([_id, data]) => ({ _id, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    // Get recent orders
    const recentOrders = currentOrders
      .sort((a: Order, b: Order) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
      .map((order: Order) => ({
        _id: order._id,
        orderNumber: order.orderNumber || order._id.toString().slice(-8),
        customerName: order.shippingAddress?.fullName || order.user?.name || 'Unknown Customer',
        total: order.total || 0,
        status: order.status || 'pending',
        createdAt: order.createdAt
      }))

    // Calculate monthly revenue (last 12 months)
    const monthlyRevenue = []
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date()
      monthStart.setMonth(monthStart.getMonth() - i)
      monthStart.setDate(1)
      monthStart.setHours(0, 0, 0, 0)
      
      const monthEnd = new Date(monthStart)
      monthEnd.setMonth(monthEnd.getMonth() + 1)
      
      const monthOrders = await DatabaseService.find('orders', {
        createdAt: {
          $gte: monthStart,
          $lt: monthEnd
        }
      }) as Order[]
      
      const monthRevenue = monthOrders.reduce((sum: number, order: Order) => sum + (order.total || 0), 0)
      
      monthlyRevenue.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue: monthRevenue,
        orders: monthOrders.length
      })
    }

    const analyticsData = {
      totalRevenue,
      totalOrders,
      totalProducts,
      totalUsers,
      revenueGrowth,
      ordersGrowth,
      topProducts,
      recentOrders,
      monthlyRevenue
    }

    return NextResponse.json(analyticsData)
  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
})