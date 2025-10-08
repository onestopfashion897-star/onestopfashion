"use client"

import { Navbar } from '@/components/ui/navbar'
import { Footer } from '@/components/ui/footer'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms & Conditions</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: January 2025</p>

        <div className="space-y-8 text-gray-600">

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
            <p className="mb-4">By accessing and using One Stop Fashion, you accept and agree to be bound by these terms and conditions.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Products and Pricing</h2>
            <p className="mb-4">All prices are in INR and subject to change. We reserve the right to modify product availability and pricing without notice.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Payment</h2>
            <p className="mb-4">Payment must be made at the time of purchase. We accept credit/debit cards, UPI, and other secure payment methods.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Shipping</h2>
            <p className="mb-4">We ship across India. Free shipping on orders over ₹999. Delivery times vary by location.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Returns & Exchanges</h2>
            <p className="mb-4">Returns accepted within 7 days of delivery for unused items with tags. Exchanges subject to availability. Contact support@onestopfashion.com for assistance.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. User Conduct</h2>
            <p className="mb-4">You must provide accurate information and use our services lawfully. You must be 18+ to purchase.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Privacy</h2>
            <p className="mb-4">We protect your personal information. See our Privacy Policy for details on data collection and usage.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Liability</h2>
            <p className="mb-4">We are not liable for indirect damages. Our liability is limited to the purchase amount.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Governing Law</h2>
            <p className="mb-4">These terms are governed by Indian law. Disputes subject to jurisdiction of Indian courts.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Contact</h2>
            <p>Email: support@onestopfashion.com | Phone: +91 98765 43210</p>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}