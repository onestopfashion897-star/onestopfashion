"use client"

import Link from 'next/link'
import { 
  Mail, 
  Phone, 
  CreditCard
} from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <img 
                src="/logo/happy-logo.png" 
                alt="Happy Feet Logo" 
                className="w-8 h-8 object-contain"
              />
              <span className="text-xl font-bold">Happy Feet</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your one-stop destination for trendy footwear and fashion. 
              We bring you the latest styles at unbeatable prices.
            </p>

          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Customer Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/help" className="text-gray-400 hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>

            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Get in Touch</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-gray-400">+91 98765 43210</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-gray-400">support@happyfeet.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods & Copyright */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Payment Methods */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400">We Accept:</span>
              <div className="flex items-center space-x-2">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded px-2 py-1">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded px-2 py-1 text-xs font-bold text-white">
                  UPI
                </div>
                <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded px-2 py-1 text-xs font-bold text-white">
                  RUPAY
                </div>
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded px-2 py-1 text-xs font-bold text-white">
                  VISA
                </div>
              </div>
            </div>

            {/* Copyright */}
            <div className="text-sm text-gray-400 text-center md:text-right">
              <div>© {new Date().getFullYear()} Happy Feet. All rights reserved.</div>
              <div className="mt-1">
                Designed and Developed by{' '}
                <Link 
                  href="https://kakkadpriyanshportfolio.vercel.app" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 transition-colors underline"
                >
                  Priyansh Kakkad
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}