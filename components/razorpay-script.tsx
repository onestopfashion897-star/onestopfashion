'use client'

import { useEffect } from 'react'

declare global {
  interface Window {
    Razorpay: any
  }
}

export function RazorpayScript() {
  useEffect(() => {
    // Check if Razorpay script is already loaded
    if (window.Razorpay) {
      return
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')
    if (existingScript) {
      return
    }

    // Create and load Razorpay script
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => {
      console.log('Razorpay script loaded successfully')
    }
    script.onerror = (error) => {
      console.warn('Razorpay script failed to load, but this is expected in development mode')
      // Don't throw error as Razorpay might not be available in development
    }

    document.body.appendChild(script)

    // Cleanup function
    return () => {
      const scriptToRemove = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')
      if (scriptToRemove && scriptToRemove.parentNode) {
        scriptToRemove.parentNode.removeChild(scriptToRemove)
      }
    }
  }, [])

  return null
}