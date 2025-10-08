"use client"

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowRight, Sparkles } from 'lucide-react'

interface Category {
  _id: string
  name: string
  slug: string
  description: string
  image?: string
  isActive: boolean
}

interface CategoriesShowcaseProps {
  categories: Category[]
}

export function CategoriesShowcase({ categories }: CategoriesShowcaseProps) {
  const activeCategories = categories.filter(category => category.isActive).slice(0, 8)

  if (activeCategories.length === 0) {
    return null
  }

  const categoryStyles = {
    'men': { icon: '👔', gradient: 'from-blue-500 to-indigo-600', bg: 'bg-blue-50' },
    'women': { icon: '👗', gradient: 'from-blue-500 to-red-600', bg: 'bg-blue-50' },
    'kids': { icon: '🧸', gradient: 'from-yellow-500 to-orange-600', bg: 'bg-yellow-50' },
    'footwear': { icon: '👟', gradient: 'from-green-500 to-emerald-600', bg: 'bg-green-50' },
    'accessories': { icon: '💎', gradient: 'from-purple-500 to-violet-600', bg: 'bg-purple-50' },
    'default': { icon: '🛍️', gradient: 'from-gray-500 to-slate-600', bg: 'bg-gray-50' }
  }

  const getCategoryStyle = (categoryName: string) => {
    const key = categoryName.toLowerCase()
    return categoryStyles[key as keyof typeof categoryStyles] || categoryStyles.default
  }

  return (
    <section className="pt-8 md:pt-12 pb-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Shop by Category</h2>
          <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full"></div>
        </div>

        {/* Desktop Grid */}
        <div className="hidden md:grid grid-cols-4 gap-6">
          {activeCategories.map((category) => {
            const style = getCategoryStyle(category.name)
            return (
              <Link
                key={category._id}
                href={`/products?category=${category.slug}`}
                className="group"
              >
                <div className="relative overflow-hidden rounded-2xl bg-white border-2 border-gray-100 hover:border-blue-500 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
                  <div className="aspect-square p-8 flex flex-col items-center justify-center">
                    <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${style.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      {category.image ? (
                        <img
                          src={category.image}
                          alt={category.name}
                          className="w-12 h-12 object-cover"
                        />
                      ) : (
                        <span className="text-3xl">
                          {style.icon}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-gray-900 text-center text-lg group-hover:text-blue-600 transition-colors">
                      {category.name}
                    </h3>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Mobile Carousel */}
        <div className="md:hidden overflow-x-auto scrollbar-hide -mx-4">
          <div className="flex gap-4 px-4 pb-4">
            {activeCategories.map((category) => {
              const style = getCategoryStyle(category.name)
              return (
                <Link
                  key={category._id}
                  href={`/products?category=${category.slug}`}
                  className="group flex-shrink-0 w-40"
                >
                  <div className="relative overflow-hidden rounded-2xl bg-white border-2 border-gray-100 hover:border-blue-500 transition-all duration-300 hover:shadow-xl">
                    <div className="aspect-square p-6 flex flex-col items-center justify-center">
                      <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${style.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                        {category.image ? (
                          <img
                            src={category.image}
                            alt={category.name}
                            className="w-10 h-10 object-cover"
                          />
                        ) : (
                          <span className="text-2xl">
                            {style.icon}
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-gray-900 text-center text-sm group-hover:text-blue-600 transition-colors">
                        {category.name}
                      </h3>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
