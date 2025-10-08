"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, Zap } from 'lucide-react'

interface Deal {
  _id: string
  title: string
  description: string
  type: string
  discountType: string
  discountValue: number
  imageUrl: string
  linkUrl: string
  startDate: string
  endDate: string
  priority: number
  isActive: boolean
}

interface DealsSectionProps {
  deals: Deal[]
}

export function DealsSection({ deals }: DealsSectionProps) {
  const [timeLeft, setTimeLeft] = useState<{ [key: string]: string }>({})
  
  const activeDeals = deals
    .filter(deal => deal.isActive && new Date(deal.endDate) > new Date())
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 3)

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft: { [key: string]: string } = {}
      
      activeDeals.forEach(deal => {
        const now = new Date().getTime()
        const endTime = new Date(deal.endDate).getTime()
        const difference = endTime - now

        if (difference > 0) {
          const days = Math.floor(difference / (1000 * 60 * 60 * 24))
          const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
          const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
          const seconds = Math.floor((difference % (1000 * 60)) / 1000)

          if (days > 0) {
            newTimeLeft[deal._id] = `${days}d ${hours}h ${minutes}m`
          } else {
            newTimeLeft[deal._id] = `${hours}h ${minutes}m ${seconds}s`
          }
        } else {
          newTimeLeft[deal._id] = 'Expired'
        }
      })
      
      setTimeLeft(newTimeLeft)
    }, 1000)

    return () => clearInterval(timer)
  }, [activeDeals])

  if (activeDeals.length === 0) {
    return null
  }

  const formatDiscount = (deal: Deal) => {
    if (deal.discountType === 'percentage') {
      return `${deal.discountValue}% OFF`
    } else if (deal.discountType === 'fixed') {
      return `₹${deal.discountValue} OFF`
    } else {
      return 'Special Offer'
    }
  }

  return (
    <section className="py-12 bg-gradient-to-r from-red-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center mb-4">
            <Zap className="w-8 h-8 text-red-500 mr-2" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Flash Deals
            </h2>
          </div>
          <p className="text-lg text-gray-600">
            Limited time offers - Grab them before they're gone!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {activeDeals.map((deal) => (
            <Card key={deal._id} className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2 border-red-200">
              <div className="relative">
                {deal.imageUrl && (
                  <img
                    src={deal.imageUrl}
                    alt={deal.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  {formatDiscount(deal)}
                </div>
                <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                  {deal.type.toUpperCase()}
                </div>
              </div>
              
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {deal.title}
                </h3>
                {deal.description && (
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {deal.description}
                  </p>
                )}
                
                <div className="flex items-center mb-4 text-red-600">
                  <Clock className="w-4 h-4 mr-2" />
                  <span className="font-semibold text-sm">
                    {timeLeft[deal._id] || 'Loading...'}
                  </span>
                </div>

                {deal.linkUrl && (
                  <Link href={deal.linkUrl}>
                    <Button className="w-full bg-red-500 hover:bg-red-600 text-white">
                      Shop Now
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link href="/deals">
            <Button variant="outline" size="lg" className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white">
              View All Deals
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}