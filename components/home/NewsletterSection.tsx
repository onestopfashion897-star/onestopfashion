"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Mail, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

export function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      toast.error('Please enter your email address')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (data.success) {
        setIsSubscribed(true)
        setEmail('')
        toast.success('Successfully subscribed to our newsletter!')
      } else {
        toast.error(data.error || 'Failed to subscribe')
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error)
      toast.error('Failed to subscribe. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="py-12 bg-gradient-to-r from-blue-600 to-indigo-700">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex items-center justify-center mb-6">
          <Mail className="w-12 h-12 text-white mr-4" />
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Stay in the Loop
          </h2>
        </div>
        
        <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
          Subscribe to our newsletter and be the first to know about new arrivals, 
          exclusive deals, and special offers!
        </p>

        {isSubscribed ? (
          <div className="flex items-center justify-center text-white">
            <CheckCircle className="w-8 h-8 mr-3" />
            <span className="text-xl font-semibold">
              Thank you for subscribing!
            </span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-white border-0 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-white"
                disabled={isLoading}
              />
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-white text-purple-600 hover:bg-gray-100 font-semibold px-8 py-2 whitespace-nowrap"
              >
                {isLoading ? 'Subscribing...' : 'Subscribe'}
              </Button>
            </div>
          </form>
        )}

        <p className="text-purple-200 text-sm mt-4">
          We respect your privacy. Unsubscribe at any time.
        </p>
      </div>
    </section>
  )
}