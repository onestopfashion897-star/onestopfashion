"use client"

import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-[#1a1a1a] text-white border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-8">
          <div>
            <h3 className="font-semibold mb-4 text-white">Information</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/about" className="hover:text-white">About Us</Link></li>
              <li><Link href="/delivery" className="hover:text-white">Delivery Information</Link></li>
              <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white">Terms & Conditions</Link></li>
              <li><Link href="/refund" className="hover:text-white">Return and Refund Policy</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4 text-white">Customer Service</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
              <li><Link href="/returns" className="hover:text-white">Returns</Link></li>
              <li><Link href="/sitemap" className="hover:text-white">Site Map</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
          <p>© {new Date().getFullYear()} Happy Feet. All rights reserved.</p>
          <p>
            Designed by{' '}
            <Link 
              href="https://kakkadpriyanshportfolio.vercel.app" 
              target="_blank" 
              className="text-white hover:underline"
            >
              Priyansh Kakkad
            </Link>
          </p>
        </div>
      </div>
    </footer>
  )
}