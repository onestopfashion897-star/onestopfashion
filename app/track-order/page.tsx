'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Navbar } from '@/components/ui/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock,
  MapPin,
  Search,
  Calendar
} from 'lucide-react'

interface TrackingInfo {
  orderId: string
  status: string
  estimatedDelivery: string
  currentLocation?: string
  trackingNumber?: string
  timeline: {
    status: string
    description: string
    timestamp: string
    completed: boolean
  }[]
}

function TrackOrderContent() {
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [orderId, setOrderId] = useState(searchParams.get('orderId') || '')
  const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const trackOrder = async () => {
    if (!orderId.trim()) {
      toast({
        title: "Order ID Required",
        description: "Please enter your order ID to track your order.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/orders/track?orderId=${orderId}`)
      const data = await response.json()

      if (data.success) {
        setTrackingInfo(data.data)
      } else {
        setError(data.error || 'Order not found')
        setTrackingInfo(null)
      }
    } catch (error) {
      console.error('Error tracking order:', error)
      setError('Failed to track order. Please try again.')
      setTrackingInfo(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (orderId) {
      trackOrder()
    }
  }, [])

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'shipped':
      case 'out for delivery':
        return 'bg-blue-100 text-blue-800'
      case 'processing':
        return 'bg-yellow-100 text-yellow-800'
      case 'pending':
        return 'bg-gray-100 text-gray-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string, completed: boolean) => {
    if (completed) {
      return <CheckCircle className="w-5 h-5 text-green-500" />
    }
    
    switch (status.toLowerCase()) {
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'shipped':
      case 'out for delivery':
        return <Truck className="w-5 h-5 text-blue-500" />
      case 'processing':
        return <Package className="w-5 h-5 text-yellow-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-400" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-16 pt-20">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Track Your Order</h1>
            <p className="text-xl text-gray-600">
              Enter your order ID to get real-time updates on your delivery
            </p>
          </div>

          {/* Search Form */}
          <Card className="mb-8 border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-3xl">
            <CardContent className="p-8">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Enter your Order ID (e.g., ORD-1234567890-ABC)"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    className="h-14 text-lg rounded-2xl border-2 focus:border-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && trackOrder()}
                  />
                </div>
                <Button
                  onClick={trackOrder}
                  disabled={loading}
                  className="h-14 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  <Search className="w-5 h-5 mr-2" />
                  {loading ? 'Tracking...' : 'Track Order'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Error Message */}
          {error && (
            <Card className="mb-8 border-0 shadow-xl bg-red-50 rounded-3xl">
              <CardContent className="p-8 text-center">
                <div className="text-red-600 text-lg font-semibold">{error}</div>
                <p className="text-red-500 mt-2">
                  Please check your order ID and try again, or contact customer support.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Tracking Information */}
          {trackingInfo && (
            <div className="space-y-8">
              {/* Order Status Overview */}
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-3xl">
                <CardHeader className="pb-6">
                  <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
                    <Package className="w-6 h-6 mr-3 text-blue-600" />
                    Order Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-2">Order ID</div>
                      <div className="font-bold text-lg">{trackingInfo.orderId}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-2">Current Status</div>
                      <Badge className={`${getStatusColor(trackingInfo.status)} px-4 py-2 text-sm font-semibold`}>
                        {trackingInfo.status}
                      </Badge>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-2">Estimated Delivery</div>
                      <div className="font-bold text-lg flex items-center justify-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(trackingInfo.estimatedDelivery).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {trackingInfo.trackingNumber && (
                    <div className="text-center p-4 bg-blue-50 rounded-2xl">
                      <div className="text-sm text-blue-600 mb-1">Tracking Number</div>
                      <div className="font-bold text-blue-800">{trackingInfo.trackingNumber}</div>
                    </div>
                  )}

                  {trackingInfo.currentLocation && (
                    <div className="text-center p-4 bg-green-50 rounded-2xl">
                      <div className="text-sm text-green-600 mb-1 flex items-center justify-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        Current Location
                      </div>
                      <div className="font-bold text-green-800">{trackingInfo.currentLocation}</div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Order Timeline */}
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-3xl">
                <CardHeader className="pb-6">
                  <CardTitle className="text-2xl font-bold text-gray-900">Order Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {trackingInfo.timeline.map((event, index) => (
                      <div key={index} className="flex items-start space-x-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          event.completed ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                          {getStatusIcon(event.status, event.completed)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className={`font-semibold ${
                              event.completed ? 'text-gray-900' : 'text-gray-500'
                            }`}>
                              {event.status}
                            </h4>
                            <span className="text-sm text-gray-500">
                              {new Date(event.timestamp).toLocaleDateString()} {new Date(event.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className={`text-sm ${
                            event.completed ? 'text-gray-600' : 'text-gray-400'
                          }`}>
                            {event.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Help Section */}
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-3xl">
                <CardContent className="p-8 text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Need Help?</h3>
                  <p className="text-gray-600 mb-6">
                    If you have any questions about your order or delivery, our customer support team is here to help.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button variant="outline" className="rounded-2xl">
                      📧 support@onestopfashionbrand.com
                    </Button>
                    <Button variant="outline" className="rounded-2xl">
                      📞  +9196625 62675
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8 pt-20">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading order tracking...</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    }>
      <TrackOrderContent />
    </Suspense>
  )
}