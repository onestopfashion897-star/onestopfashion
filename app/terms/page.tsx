"use client"

import { Navbar } from '@/components/ui/navbar'
import { Footer } from '@/components/ui/footer'
import { FileText, ShoppingCart, CreditCard, Truck, RefreshCw, User, Shield, Scale, Gavel, Mail } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Terms & Conditions</h1>
          <p className="text-gray-600 text-lg">Last updated: January 2025</p>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-xl shadow-sm border">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
                <p className="text-gray-600">By accessing and using One Stop Fashion, you accept and agree to be bound by these terms and conditions.</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Products and Pricing</h2>
                <p className="text-gray-600">All prices are in INR and subject to change. We reserve the right to modify product availability and pricing without notice.</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Payment</h2>
                <p className="text-gray-600">Payment must be made at the time of purchase. We accept credit/debit cards, UPI, and other secure payment methods.</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Shipping</h2>
                <p className="text-gray-600">We ship across India. Free shipping on orders over ₹999. Delivery times vary by location.</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                <RefreshCw className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Returns & Exchanges</h2>
                <p className="text-gray-600">Returns accepted within 7 days of delivery for unused items with tags. Exchanges subject to availability. Contact fentrainfrapvtltd@gmail.com
 for assistance.</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">6. User Conduct</h2>
                <p className="text-gray-600">You must provide accurate information and use our services lawfully. You must be 18+ to purchase.</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Privacy</h2>
                <p className="text-gray-600">We protect your personal information. See our Privacy Policy for details on data collection and usage.</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                <Scale className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Liability</h2>
                <p className="text-gray-600">We are not liable for indirect damages. Our liability is limited to the purchase amount.</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                <Gavel className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Governing Law</h2>
                <p className="text-gray-600">These terms are governed by Indian law. Disputes subject to jurisdiction of Indian courts.</p>
              </div>
            </div>
          </div>

          <div className="bg-black text-white p-8 rounded-xl">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-black" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-3">10. Contact</h2>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a href="mailto:fentrainfrapvtltd@gmail.com
" className="text-white hover:text-gray-300">socodebusinesspvtltd@gmail.com
</a>
                  <span className="hidden sm:inline text-gray-500">|</span>
                  <a href="tel:+919173803878

" className="text-white hover:text-gray-300">+91 96625 62675</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}