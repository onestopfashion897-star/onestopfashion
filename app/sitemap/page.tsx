"use client"

import { Navbar } from '@/components/ui/navbar'
import { Footer } from '@/components/ui/footer'
import Link from 'next/link'
import { ShoppingBag, User, Info, Headphones } from 'lucide-react'

export default function SitemapPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Site Map</h1>
          <p className="text-gray-600 text-lg">Quick navigation to all pages</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Shop</h2>
            </div>
            <ul className="space-y-2 text-gray-600">
              <li><Link href="/products" className="hover:text-black transition-colors">→ All Products</Link></li>
              <li><Link href="/products?category=men" className="hover:text-black transition-colors">→ Men</Link></li>
              <li><Link href="/products?category=women" className="hover:text-black transition-colors">→ Women</Link></li>
              <li><Link href="/products?category=kids" className="hover:text-black transition-colors">→ Kids</Link></li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Account</h2>
            </div>
            <ul className="space-y-2 text-gray-600">
              <li><Link href="/login" className="hover:text-black transition-colors">→ Login</Link></li>
              <li><Link href="/register" className="hover:text-black transition-colors">→ Register</Link></li>
              <li><Link href="/account" className="hover:text-black transition-colors">→ My Account</Link></li>
              <li><Link href="/account/orders" className="hover:text-black transition-colors">→ Orders</Link></li>
              <li><Link href="/cart" className="hover:text-black transition-colors">→ Cart</Link></li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                <Info className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Information</h2>
            </div>
            <ul className="space-y-2 text-gray-600">
              <li><Link href="/about" className="hover:text-black transition-colors">→ About Us</Link></li>
              <li><Link href="/delivery" className="hover:text-black transition-colors">→ Delivery Information</Link></li>
              <li><Link href="/privacy" className="hover:text-black transition-colors">→ Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-black transition-colors">→ Terms & Conditions</Link></li>
              <li><Link href="/refund" className="hover:text-black transition-colors">→ Return and Refund Policy</Link></li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                <Headphones className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Customer Service</h2>
            </div>
            <ul className="space-y-2 text-gray-600">
              <li><Link href="/contact" className="hover:text-black transition-colors">→ Contact Us</Link></li>
              <li><Link href="/returns" className="hover:text-black transition-colors">→ Returns</Link></li>
              <li><Link href="/help" className="hover:text-black transition-colors">→ Help Center</Link></li>
            </ul>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}
