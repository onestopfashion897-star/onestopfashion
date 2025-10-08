"use client"

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  CheckCircle, 
  XCircle, 
  ArrowRight, 
  Home, 
  ShoppingBag,
  Package,
  CreditCard
} from 'lucide-react'
import { Navbar } from '@/components/ui/navbar'
import { useAuth } from '@/contexts/AuthContext'

function PaymentResultContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [countdown, setCountdown] = useState(5)
  
  const status = searchParams.get('status') // 'success' or 'failed'
  const orderId = searchParams.get('orderId')
  const paymentId = searchParams.get('paymentId')
  
  const isSuccess = status === 'success'
  
  useEffect(() => {
    // Redirect to orders page after 5 seconds
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          router.push('/account/orders')
          return 0
        }
        return prev - 1
      })
    }, 1000)
    
    return () => clearInterval(timer)
  }, [router])
  
  const handleRedirectNow = () => {
    router.push('/account/orders')
  }
  
  if (!user) {
    router.push('/login')
    return null
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Navbar />
      <div className="container mx-auto px-4 py-16 pt-20">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-2xl border-0 overflow-hidden">
            <CardHeader className={`text-center py-12 ${isSuccess ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-red-600'} text-white`}>
              <div className="flex justify-center mb-6">
                {isSuccess ? (
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-12 h-12 text-white" />
                  </div>
                ) : (
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                    <XCircle className="w-12 h-12 text-white" />
                  </div>
                )}
              </div>
              <CardTitle className="text-3xl font-bold mb-4">
                {isSuccess ? 'Payment Successful!' : 'Payment Failed!'}
              </CardTitle>
              <p className="text-white/90 text-lg">
                {isSuccess 
                  ? 'Your order has been placed successfully and payment has been processed.'
                  : 'We encountered an issue processing your payment. Please try again.'
                }
              </p>
            </CardHeader>
            
            <CardContent className="p-8 space-y-6">
              {/* Payment Details */}
              <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
                  Payment Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {orderId && (
                    <div>
                      <span className="text-gray-600">Order ID:</span>
                      <p className="font-medium text-gray-900">{orderId}</p>
                    </div>
                  )}
                  {paymentId && (
                    <div>
                      <span className="text-gray-600">Payment ID:</span>
                      <p className="font-medium text-gray-900">{paymentId}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <p className={`font-medium ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
                      {isSuccess ? 'Completed' : 'Failed'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Date:</span>
                    <p className="font-medium text-gray-900">
                      {new Date().toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Auto Redirect Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-center">
                <p className="text-blue-800 text-sm">
                  You will be automatically redirected to your orders page in <span className="font-bold">{countdown}</span> seconds
                </p>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button 
                  onClick={handleRedirectNow}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Package className="w-5 h-5 mr-2" />
                  View My Orders
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                
                <Link href="/" className="flex-1">
                  <Button 
                    variant="outline" 
                    className="w-full py-3 rounded-2xl font-semibold border-2 hover:bg-gray-50 transition-all duration-300"
                  >
                    <Home className="w-5 h-5 mr-2" />
                    Continue Shopping
                  </Button>
                </Link>
              </div>
              
              {!isSuccess && (
                <div className="pt-4">
                  <Link href="/cart" className="w-full">
                    <Button 
                      variant="outline" 
                      className="w-full py-3 rounded-2xl font-semibold border-2 border-red-200 text-red-600 hover:bg-red-50 transition-all duration-300"
                    >
                      <ShoppingBag className="w-5 h-5 mr-2" />
                      Try Payment Again
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function PaymentResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Navbar />
        <div className="container mx-auto px-4 py-16 pt-20">
          <div className="max-w-2xl mx-auto">
            <Card className="shadow-2xl border-0 overflow-hidden">
              <CardContent className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading payment result...</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    }>
      <PaymentResultContent />
    </Suspense>
  )
}