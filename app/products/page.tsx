"use client"

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { ArrowRight, Star, Heart, ShoppingCart, Filter, Grid, List, Search, X } from 'lucide-react'
import { Product, Category, Brand } from '@/lib/types'
import { useCart } from '@/contexts/CartContext'
import { useWishlist } from '@/contexts/WishlistContext'
import { useAuth } from '@/contexts/AuthContext'
import { Navbar } from '@/components/ui/navbar'

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  
  // Filters
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all')
  const [selectedBrand, setSelectedBrand] = useState('all')
  const [priceRange, setPriceRange] = useState([0, 10000])
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const { addItem } = useCart()
  const { addItem: addToWishlist, isInWishlist, removeItem: removeFromWishlist } = useWishlist()
  const { user } = useAuth()

  useEffect(() => {
    fetchData()
  }, [])

  // Auto-refresh once when user first enters the page
  useEffect(() => {
    const hasRefreshed = sessionStorage.getItem('productsPageRefreshed')
    if (!hasRefreshed) {
      sessionStorage.setItem('productsPageRefreshed', 'true')
      window.location.reload()
    }
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [searchQuery, selectedCategory, selectedBrand, priceRange, selectedSizes, sortBy, sortOrder])

  const fetchData = async () => {
    try {
      // Fetch all active categories and brands
      const [categoriesRes, brandsRes] = await Promise.all([
        fetch('/api/categories?isActive=true'),
        fetch('/api/brands?isActive=true')
      ])
      
      const categoriesData = await categoriesRes.json()
      const brandsData = await brandsRes.json()
      
      if (categoriesData.success) setCategories(categoriesData.data)
      if (brandsData.success) setBrands(brandsData.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      if (selectedCategory !== 'all') params.append('category', selectedCategory)
      if (selectedBrand !== 'all') params.append('brand', selectedBrand)
      if (priceRange[1] < 10000) params.append('maxPrice', priceRange[1].toString())
      if (selectedSizes.length > 0) params.append('sizes', selectedSizes.join(','))
      params.append('sortBy', sortBy)
      params.append('sortOrder', sortOrder)

      const response = await fetch(`/api/products?${params.toString()}`)
      const data = await response.json()
      
      if (data.success) {
        setProducts(data.data)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = (product: Product, size: string) => {
    addItem({
      productId: product._id!.toString(),
      name: product.name,
      price: product.price,
      offerPrice: product.offerPrice,
      quantity: 1,
      size,
      image: product.images[0],
      stock: product.stock,
    })
  }

  const handleWishlistToggle = (productId: string) => {
    if (isInWishlist(productId)) {
      removeFromWishlist(productId)
    } else {
      addToWishlist(productId)
    }
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('all')
    setSelectedBrand('all')
    setPriceRange([0, 10000])
    setSelectedSizes([])
    setSortBy('name')
    setSortOrder('asc')
  }

  const ProductCard = ({ product }: { product: Product }) => {
    const discount = product.offerPrice ? Math.round(((product.price - product.offerPrice) / product.price) * 100) : 0

    return (
      <Link href={`/products/${product._id}`}>
        <Card className="group relative overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer">
          <div className="relative aspect-square overflow-hidden">
            <Image
              src={product.images[0] || '/placeholder.jpg'}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {discount > 0 && (
              <Badge className="absolute top-2 left-2 bg-red-500 text-white">
                -{discount}%
              </Badge>
            )}
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-2 right-2 bg-white/80 hover:bg-white"
              onClick={(e) => {
                e.preventDefault()
                handleWishlistToggle(product._id!.toString())
              }}
            >
              <Heart 
                className={`w-4 h-4 ${isInWishlist(product._id!.toString()) ? 'fill-red-500 text-red-500' : ''}`} 
              />
            </Button>
          </div>
          <CardContent className="p-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-sm line-clamp-2">{product.name}</h3>
              {product.brand?.name && (
                <p className="text-xs text-gray-500">{product.brand.name}</p>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg">
                    ₹{product.offerPrice || product.price}
                  </span>
                  {product.offerPrice && (
                    <span className="text-sm text-gray-500 line-through">
                      ₹{product.price}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs">{product.rating || 4.5}</span>
                </div>
              </div>

            </div>
          </CardContent>
        </Card>
      </Link>
    )
  }

  const ProductListItem = ({ product }: { product: Product }) => {
    const discount = product.offerPrice ? Math.round(((product.price - product.offerPrice) / product.price) * 100) : 0

    return (
      <Link href={`/products/${product._id}`}>
        <Card className="group relative overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer">
          <div className="flex">
            <div className="relative w-48 h-48 overflow-hidden">
              <Image
                src={product.images[0] || '/placeholder.jpg'}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {discount > 0 && (
                <Badge className="absolute top-2 left-2 bg-red-500 text-white">
                  -{discount}%
                </Badge>
              )}
            </div>
            <CardContent className="flex-1 p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                  {product.brand?.name && (
                    <p className="text-gray-500 mb-2">{product.brand.name}</p>
                  )}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description}</p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xl">
                        ₹{product.offerPrice || product.price}
                      </span>
                      {product.offerPrice && (
                        <span className="text-sm text-gray-500 line-through">
                          ₹{product.price}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">{product.rating || 4.5}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-4">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => {
                      e.preventDefault()
                      handleWishlistToggle(product._id!.toString())
                    }}
                  >
                    <Heart 
                      className={`w-5 h-5 ${isInWishlist(product._id!.toString()) ? 'fill-red-500 text-red-500' : ''}`} 
                    />
                  </Button>
                  <div className="flex gap-2">
                    {product.sizes.slice(0, 4).map((size) => (
                      <Button
                        key={size}
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.preventDefault()
                          handleAddToCart(product, size)
                        }}
                      >
                        {size}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>
      </Link>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">All Products</h1>
          <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full mb-4"></div>
          <p className="text-gray-600 text-lg">Discover our amazing collection of {products.length} products</p>
        </div>

        {/* Search and Filters Bar */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search */}
            <div className="flex-1 w-full lg:w-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 rounded-xl border-gray-200 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Sort */}
            <div className="flex gap-3">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-36 h-12 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="createdAt">Newest</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
                <SelectTrigger className="w-24 h-12 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">↑ Asc</SelectItem>
                  <SelectItem value="desc">↓ Desc</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* View Mode */}
            <div className="flex gap-2 bg-gray-100 rounded-xl p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-lg"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-lg"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>

            {/* Filter Toggle for Mobile */}
            <Sheet open={showFilters} onOpenChange={setShowFilters}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  className="lg:hidden h-12 rounded-xl"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
            </Sheet>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Desktop Filters Sidebar */}
          <div className="hidden lg:block w-72 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg">Filters</h3>
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-blue-600 hover:text-blue-700">
                  Clear All
                </Button>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h4 className="font-semibold mb-4 text-gray-900">Categories</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="all-categories"
                      checked={selectedCategory === 'all'}
                      onCheckedChange={() => setSelectedCategory('all')}
                    />
                    <label htmlFor="all-categories" className="text-sm">All Categories</label>
                  </div>
                  {categories.map((category) => (
                    <div key={category._id?.toString()} className="flex items-center space-x-2">
                      <Checkbox
                        id={category._id?.toString()}
                        checked={selectedCategory === category._id?.toString()}
                        onCheckedChange={() => setSelectedCategory(category._id?.toString() || 'all')}
                      />
                      <label htmlFor={category._id?.toString()} className="text-sm">{category.name}</label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Brands */}
              <div className="mb-6 mt-6">
                <h4 className="font-semibold mb-4 text-gray-900">Brands</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="all-brands"
                      checked={selectedBrand === 'all'}
                      onCheckedChange={() => setSelectedBrand('all')}
                    />
                    <label htmlFor="all-brands" className="text-sm">All Brands</label>
                  </div>
                  {brands.map((brand) => (
                    <div key={brand._id?.toString()} className="flex items-center space-x-2">
                      <Checkbox
                        id={brand._id?.toString()}
                        checked={selectedBrand === brand._id?.toString()}
                        onCheckedChange={() => setSelectedBrand(brand._id?.toString() || 'all')}
                      />
                      <label htmlFor={brand._id?.toString()} className="text-sm">{brand.name}</label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Sizes */}
              <div className="mb-6 mt-6">
                <h4 className="font-semibold mb-4 text-gray-900">Sizes</h4>
                <div className="grid grid-cols-3 gap-2">
                  {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                    <Button
                      key={size}
                      variant={selectedSizes.includes(size) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setSelectedSizes(prev => 
                          prev.includes(size) 
                            ? prev.filter(s => s !== size)
                            : [...prev, size]
                        )
                      }}
                      className="rounded-lg"
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Price Range */}
              <div className="mb-6 mt-6">
                <h4 className="font-semibold mb-4 text-gray-900">Price Range</h4>
                <div className="px-2">
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={10000}
                    step={100}
                    className="mb-6"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-center">
                    <div className="text-xs text-blue-600 font-medium mb-1">Min</div>
                    <div className="text-lg font-bold text-blue-900">₹{priceRange[0].toLocaleString()}</div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-center">
                    <div className="text-xs text-blue-600 font-medium mb-1">Max</div>
                    <div className="text-lg font-bold text-blue-900">₹{priceRange[1].toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Filters Sheet */}
          <Sheet open={showFilters} onOpenChange={setShowFilters}>
            <SheetContent side="left" className="w-80 p-0">
            <div className="p-6">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              
              <div className="mt-6 space-y-6">
                {/* Categories */}
                <div>
                  <h4 className="font-medium mb-3">Categories</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="mobile-all-categories"
                        checked={selectedCategory === 'all'}
                        onCheckedChange={() => setSelectedCategory('all')}
                      />
                      <label htmlFor="mobile-all-categories" className="text-sm">All Categories</label>
                    </div>
                    {categories.map((category) => (
                      <div key={`mobile-${category._id?.toString()}`} className="flex items-center space-x-2">
                        <Checkbox
                          id={`mobile-${category._id?.toString()}`}
                          checked={selectedCategory === category._id?.toString()}
                          onCheckedChange={() => setSelectedCategory(category._id?.toString() || 'all')}
                        />
                        <label htmlFor={`mobile-${category._id?.toString()}`} className="text-sm">{category.name}</label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Brands */}
                <div>
                  <h4 className="font-medium mb-3">Brands</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="mobile-all-brands"
                        checked={selectedBrand === 'all'}
                        onCheckedChange={() => setSelectedBrand('all')}
                      />
                      <label htmlFor="mobile-all-brands" className="text-sm">All Brands</label>
                    </div>
                    {brands.map((brand) => (
                      <div key={`mobile-${brand._id?.toString()}`} className="flex items-center space-x-2">
                        <Checkbox
                          id={`mobile-${brand._id?.toString()}`}
                          checked={selectedBrand === brand._id?.toString()}
                          onCheckedChange={() => setSelectedBrand(brand._id?.toString() || 'all')}
                        />
                        <label htmlFor={`mobile-${brand._id?.toString()}`} className="text-sm">{brand.name}</label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Sizes */}
                <div>
                  <h4 className="font-medium mb-3">Sizes</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                      <Button
                        key={size}
                        variant={selectedSizes.includes(size) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          setSelectedSizes(prev => 
                            prev.includes(size) 
                              ? prev.filter(s => s !== size)
                              : [...prev, size]
                          )
                        }}
                        className="rounded-lg"
                      >
                        {size}
                      </Button>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Price Range */}
                <div>
                  <h4 className="font-medium mb-3">Price Range</h4>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={10000}
                    step={100}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>₹{priceRange[0]}</span>
                    <span>₹{priceRange[1]}</span>
                  </div>
                </div>

                {/* Clear Filters Button */}
                <Button onClick={clearFilters} variant="outline" className="w-full">
                  Clear All Filters
                </Button>
              </div>
             </div>
           </SheetContent>
          </Sheet>

          {/* Products Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-sm border p-4 animate-pulse">
                    <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                    <div className="space-y-2">
                      <div className="bg-gray-200 h-4 rounded"></div>
                      <div className="bg-gray-200 h-4 rounded w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                : "space-y-4"
              }>
                {products.map((product) => (
                  viewMode === 'grid' 
                    ? <ProductCard key={product._id?.toString()} product={product} />
                    : <ProductListItem key={product._id?.toString()} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Search className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria</p>
                <Button onClick={clearFilters} variant="outline">
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
