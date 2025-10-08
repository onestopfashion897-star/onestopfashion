"use client"

import { Navbar } from '@/components/ui/navbar'
import { Footer } from '@/components/ui/footer'
import { CheckCircle, XCircle, Package, CreditCard, RefreshCw, Truck, AlertTriangle } from 'lucide-react'

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Return and Refund Policy</h1>
          <p className="text-gray-600 text-lg">Last updated: January 2025</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-xl shadow-sm border text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">7 Days Return</h3>
            <p className="text-gray-600 text-sm">Easy returns within 7 days</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Quick Refund</h3>
            <p className="text-gray-600 text-sm">Processed in 5-7 days</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Free Exchange</h3>
            <p className="text-gray-600 text-sm">Size & color exchanges</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-xl shadow-sm border">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Return Eligibility</h2>
                <p className="text-gray-600">You may return most new, unopened items within 7 days of delivery for a full refund. Items must be in original condition with all tags attached.</p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 p-8 rounded-xl">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                <XCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-red-900 mb-3">Non-Returnable Items</h2>
                <ul className="text-red-800 space-y-2">
                  <li>• Intimate apparel and undergarments</li>
                  <li>• Items marked as final sale</li>
                  <li>• Gift cards</li>
                  <li>• Personalized or customized items</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                <RefreshCw className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">How to Return</h2>
                <p className="text-gray-600 mb-4">To initiate a return:</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4 ml-14">
              <div className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                <p className="text-gray-600 text-sm">Contact us at support@onestopfashion.com with your order number</p>
              </div>
              <div className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                <p className="text-gray-600 text-sm">Pack the item securely in its original packaging</p>
              </div>
              <div className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                <p className="text-gray-600 text-sm">Include the invoice or packing slip</p>
              </div>
              <div className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold">4</span>
                <p className="text-gray-600 text-sm">Ship to the address provided by our support team</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Refund Processing</h2>
                <p className="text-gray-600">Once we receive your return, we will inspect it and process your refund within 5-7 business days. Refunds will be credited to your original payment method.</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Return Shipping Costs</h2>
                <p className="text-gray-600">Return shipping costs are the responsibility of the customer unless the item is defective or we made an error in your order.</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 p-8 rounded-xl">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-yellow-600 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-yellow-900 mb-3">Damaged or Defective Items</h2>
                <p className="text-yellow-800">If you receive a damaged or defective item, contact us immediately at support@onestopfashion.com with photos. We will arrange a free return and full refund or replacement.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-black text-white rounded-xl p-8 text-center mt-8">
          <h3 className="text-xl font-semibold mb-2">Need Help?</h3>
          <p className="text-gray-300 mb-4">Contact us for return and refund queries</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="mailto:support@onestopfashion.com" className="text-white hover:text-gray-300">support@onestopfashion.com</a>
            <span className="hidden sm:inline text-gray-500">|</span>
            <a href="tel:+919876543210" className="text-white hover:text-gray-300">+91 98765 43210</a>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}
