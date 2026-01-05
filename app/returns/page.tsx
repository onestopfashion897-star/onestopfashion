"use client"

import { Navbar } from '@/components/ui/navbar'
import { Footer } from '@/components/ui/footer'
import { Package, Clock, CreditCard, XCircle, Mail } from 'lucide-react'

export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Returns & Refunds</h1>
          <p className="text-gray-600 text-lg">Easy returns within 7 days of delivery</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mb-4">
              <Package className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Return Policy</h3>
            <p className="text-gray-600 text-sm">We accept returns within 7 days of delivery. Items must be unused, unworn, and in original condition with all tags attached.</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Refund Timeline</h3>
            <p className="text-gray-600 text-sm">Refunds are processed within 5-7 business days after we receive and inspect your return.</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Return</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold">1</div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Contact Us</h3>
                <p className="text-gray-600 text-sm">Email socodebusinesspvtltd@gmail.com
 with your order number</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold">2</div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Get Instructions</h3>
                <p className="text-gray-600 text-sm">We will provide you with return instructions and address</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold">3</div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Pack & Ship</h3>
                <p className="text-gray-600 text-sm">Pack the item securely with the invoice and ship to provided address</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold">4</div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Receive Refund</h3>
                <p className="text-gray-600 text-sm">Get your refund within 5-7 business days after inspection</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
          <div className="flex gap-3">
            <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-900 mb-2">Non-Returnable Items</h3>
              <ul className="text-red-800 text-sm space-y-1">
                <li>• Intimate apparel and undergarments</li>
                <li>• Final sale items</li>
                <li>• Gift cards</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-black text-white rounded-xl p-8 text-center">
          <Mail className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Need Help?</h3>
          <p className="text-gray-300 mb-4">Our support team is here to assist you</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="mailto:fentrainfrapvtltd@gmail.com
" className="text-white hover:text-gray-300">socodebusinesspvtltd@gmail.com
</a>
            <span className="hidden sm:inline text-gray-500">|</span>
            <a href="tel:+919173803878

" className="text-white hover:text-gray-300">+91 96625 62675</a>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}
