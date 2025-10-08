"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, ShoppingCart, Heart, User, Menu, X, Settings, Crown } from "lucide-react"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useCart } from "@/contexts/CartContext"
import { useWishlist } from "@/contexts/WishlistContext"

interface Category {
  _id: string
  name: string
  slug: string
  description: string
  isActive: boolean
}

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [categories, setCategories] = useState<Category[]>([])
  const [hasNavBeenOpened, setHasNavBeenOpened] = useState(false)
  const { user, loading, logout } = useAuth()
  const { getItemCount: getCartCount } = useCart()
  const { getItemCount: getWishlistCount } = useWishlist()

  // Check if user is admin
  const isAdmin = user?.role === 'admin'

  // Fetch categories function
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories?isActive=true&limit=10')
      if (response.ok) {
        const result = await response.json()
        // Extract categories from the API response structure
        const categoriesData = result.success ? result.data : []
        setCategories(Array.isArray(categoriesData) ? categoriesData : [])
      } else {
        setCategories([])
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      setCategories([])
    }
  }

  // Initial fetch on component mount
  useEffect(() => {
    fetchCategories()
  }, [])

  // Handle navigation hover/focus for lazy loading
  const handleNavInteraction = () => {
    if (!hasNavBeenOpened) {
      setHasNavBeenOpened(true)
      fetchCategories() // Reload categories once after first interaction
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery.trim())}`
    }
  }

  const handleLogout = () => {
    logout()
    setIsMenuOpen(false)
  }

  return (
    <>
      <nav className="bg-[#1a1a1a] border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <img 
                src="/logo/happy-logo.png" 
                alt="Happy Feet Logo" 
                className="w-24 h-12 object-contain"
              />
            </Link>

            {/* Desktop Navigation */}
            <div 
              className="hidden md:flex items-center space-x-8"
              onMouseEnter={handleNavInteraction}
              onFocus={handleNavInteraction}
            >
              <Link href="/" className="text-white hover:text-gray-300 transition-colors font-medium">
                Home
              </Link>
              <Link href="/products" className="text-gray-300 hover:text-white transition-colors">
                Shop
              </Link>
              <Link href="/products" className="text-gray-300 hover:text-white transition-colors">
                Sale
              </Link>
              <Link href="/about" className="text-gray-300 hover:text-white transition-colors">
                Blog
              </Link>
              <Link href="/contact" className="text-gray-300 hover:text-white transition-colors">
                Showcase
              </Link>
            </div>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <form onSubmit={handleSearch} className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 rounded-full bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-white/40 focus:ring-white/20"
                />
              </form>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {/* Wishlist */}
              <Link href="/cart">
                <Button variant="ghost" size="icon" className="relative text-white hover:bg-white/10">
                  <ShoppingCart className="w-5 h-5" />
                </Button>
              </Link>

              {/* User Menu */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-white hover:bg-white/10">
                      Login
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64">
                    <DropdownMenuLabel className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                        {isAdmin && (
                          <div className="flex items-center gap-1 text-xs text-purple-600">
                            <Crown className="w-3 h-3" />
                            Admin
                          </div>
                        )}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/account" className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/account/orders" className="flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4" />
                        Orders
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/account/wishlist" className="flex items-center gap-2">
                        <Heart className="w-4 h-4" />
                        Wishlist
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/account/addresses" className="flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        Addresses
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/admin" className="flex items-center gap-2 text-purple-600 font-medium">
                            <Crown className="w-4 h-4" />
                            Admin Panel
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : loading ? (
                <div className="hidden md:flex items-center space-x-2">
                  <div className="w-8 h-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent"></div>
                </div>
              ) : (
                <div className="hidden md:flex items-center space-x-2">
                  <Link href="/login">
                    <Button variant="ghost" className="text-white hover:bg-white/10">Login</Button>
                  </Link>
                  <Link href="/register">
                    <Button className="bg-white text-black hover:bg-gray-100 rounded-full">
                      Sign up
                    </Button>
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-white hover:bg-white/10"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-white/10 bg-[#1a1a1a]">
            <div className="px-4 py-4 space-y-4">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 rounded-full"
                />
              </form>

              {/* Mobile Navigation Links */}
              <div className="space-y-2">
                <Link
                  href="/products"
                  className="block py-2 text-gray-700 hover:text-purple-600 transition-colors font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Products
                </Link>
                {categories.map((category) => (
                  <Link
                    key={category._id}
                    href={`/products?category=${category.slug}`}
                    className="block py-2 text-gray-700 hover:text-purple-600 transition-colors capitalize"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {category.name}
                  </Link>
                ))}
              </div>

              {/* Mobile Auth */}
              {loading ? (
                <div className="space-y-2 pt-4 border-t flex justify-center">
                  <div className="w-6 h-6 animate-spin rounded-full border-2 border-purple-500 border-t-transparent"></div>
                </div>
              ) : !user ? (
                <div className="space-y-2 pt-4 border-t">
                  <Link href="/login">
                    <Button variant="ghost" className="w-full justify-start" onClick={() => setIsMenuOpen(false)}>
                      Login
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" onClick={() => setIsMenuOpen(false)}>
                      Sign Up
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2 pt-4 border-t">
                  <div className="px-2 py-1 text-sm text-gray-500">
                    Welcome, {user.name}
                    {isAdmin && (
                      <span className="ml-2 flex items-center gap-1 text-purple-600">
                        <Crown className="w-3 h-3" />
                        Admin
                      </span>
                    )}
                  </div>
                  <Link href="/account">
                    <Button variant="ghost" className="w-full justify-start" onClick={() => setIsMenuOpen(false)}>
                      Profile
                    </Button>
                  </Link>
                  <Link href="/account/orders">
                    <Button variant="ghost" className="w-full justify-start" onClick={() => setIsMenuOpen(false)}>
                      Orders
                    </Button>
                  </Link>
                  <Link href="/account/wishlist">
                    <Button variant="ghost" className="w-full justify-start" onClick={() => setIsMenuOpen(false)}>
                      Wishlist
                    </Button>
                  </Link>
                  {isAdmin && (
                    <Link href="/admin">
                      <Button variant="ghost" className="w-full justify-start text-purple-600 font-medium" onClick={() => setIsMenuOpen(false)}>
                        <Crown className="w-4 h-4 mr-2" />
                        Admin Panel
                      </Button>
                    </Link>
                  )}
                  <Button variant="ghost" className="w-full justify-start text-red-600" onClick={handleLogout}>
                    Logout
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
      {/* Spacer to prevent content from being hidden behind sticky navbar */}
      <div className="h-0"></div>
    </>
  )
}

