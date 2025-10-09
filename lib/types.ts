import { ObjectId } from 'mongodb'

// Base interface for all documents
export interface BaseDocument {
  _id?: ObjectId
  createdAt: Date
  updatedAt: Date
}

// User types
export interface User extends BaseDocument {
  name: string
  email: string
  phone?: string
  password: string
  role: 'user' | 'admin'
  addresses: Address[]
  isEmailVerified: boolean
  isPhoneVerified: boolean
  avatar?: string
}

export interface Address {
  id: string
  name: string
  phone: string
  address: string
  city: string
  state: string
  pincode: string
  isDefault: boolean
}

// Size stock interface for size-specific stock management
export interface SizeStock {
  size: string
  stock: number
}

// Product variant interface for color/model variations
export interface ProductVariant {
  id: string
  name: string // e.g., "Red", "Blue", "Model A", "Model B"
  type: 'color' | 'model' // Type of variant
  value: string // Color code (hex) or model identifier
  images: string[] // Variant-specific images
  price?: number // Optional variant-specific price
  offerPrice?: number // Optional variant-specific offer price
  stock: number // Variant-specific stock
  sizeStocks?: SizeStock[] // Size-specific stock for this variant
  sku: string // Variant-specific SKU
  isActive: boolean
}

// Product types
export interface Product extends BaseDocument {
  name: string
  description: string
  categoryId: ObjectId
  brandId: ObjectId
  price: number
  offerPrice?: number
  images: string[]
  galleryImages: string[] // Additional gallery images
  sizes: string[]
  stock: number
  sizeStocks?: SizeStock[] // Size-specific stock management
  variants?: ProductVariant[] // Color/model variants
  hasVariants: boolean // Flag to indicate if product has variants
  sku: string
  featured: boolean
  isActive: boolean
  specifications?: Record<string, string>
  tags: string[]
  rating?: number
  reviewCount?: number
  sizeChart?: string // Optional size chart image URL
  // Virtual fields for populated data
  category?: Category
  brand?: Brand
}

// Category types
export interface Category extends BaseDocument {
  name: string
  slug: string
  description: string
  image?: string
  parentCategoryId?: ObjectId
  isActive: boolean
  // Virtual fields for populated data
  parentCategory?: Category
  subcategories?: Category[]
}

// Brand types
export interface Brand extends BaseDocument {
  name: string
  slug: string
  description: string
  logoUrl?: string
  website?: string
  isActive: boolean
}

// Payment method type
export type PaymentMethod = 'cod' | 'razorpay'

// Order types
export interface Order extends BaseDocument {
  orderId: string
  userId: ObjectId
  items: OrderItem[]
  shippingAddress: Address
  paymentMethod: PaymentMethod
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  orderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  subtotal: number
  shippingCost: number
  discount: number
  total: number
  razorpayOrderId?: string
  razorpayPaymentId?: string
  trackingNumber?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface OrderItem {
  productId: ObjectId
  name: string
  price: number
  quantity: number
  size: string
  image: string
  variantId?: string // Optional variant ID
  variantName?: string // Optional variant name (e.g., "Red", "Model A")
  variantType?: 'color' | 'model' // Optional variant type
}

// Cart types
export interface CartItem {
  productId: string
  name: string
  price: number
  offerPrice?: number
  quantity: number
  size: string
  image: string
  stock: number
  variantId?: string // Optional variant ID
  variantName?: string // Optional variant name (e.g., "Red", "Model A")
  variantType?: 'color' | 'model' // Optional variant type
}

export interface Cart extends BaseDocument {
  userId: ObjectId
  items: {
    productId: ObjectId
    name: string
    price: number
    offerPrice?: number
    quantity: number
    size: string
    image: string
    stock: number
    variantId?: string // Optional variant ID
    variantName?: string // Optional variant name (e.g., "Red", "Model A")
    variantType?: 'color' | 'model' // Optional variant type
  }[]
  total: number
  itemCount: number
}

// Review types
export interface Review extends BaseDocument {
  productId: ObjectId
  userId: ObjectId
  orderId: ObjectId // Required for purchase verification
  rating: number // 1-5 stars
  comment: string
  status: 'pending' | 'approved' | 'rejected'
  helpful: number
  reported: boolean
  reviewerName?: string // Cached user name for display
  reviewerAvatar?: string // Cached user avatar for display
  adminResponse?: string // Admin response to review
  adminResponseAt?: Date // When admin responded
  verifiedPurchase: boolean // Flag to indicate verified purchase
}

// Wishlist types
export interface Wishlist extends BaseDocument {
  userId: ObjectId
  productId: ObjectId
}

// Coupon types
export interface Coupon extends BaseDocument {
  code: string
  description: string
  type: 'percentage' | 'fixed' | 'shipping'
  value: number
  minAmount: number
  maxDiscount?: number
  usageLimit: number
  usedCount: number
  validFrom: Date
  validUntil: Date
  isActive: boolean
  applicableCategories?: string[]
  applicableProducts?: ObjectId[]
}

// Admin types
export interface Admin extends BaseDocument {
  name: string
  email: string
  password: string
  role: 'admin' | 'super_admin'
  permissions: string[]
  isActive: boolean
}

// Contact Query types
export interface ContactQuery extends BaseDocument {
  name: string
  email: string
  phone: string
  subject: string
  message: string
  status: 'new' | 'in_progress' | 'resolved'
  priority: 'low' | 'medium' | 'high'
  category: 'general' | 'delivery' | 'returns' | 'payment' | 'technical'
  assignedTo?: ObjectId
  response?: string
  resolvedAt?: Date
}

// Razorpay types
export interface RazorpayPayment {
  id: string
  orderId: string
  paymentId: string
  signature: string
  amount: number
  currency: string
  status: 'created' | 'authorized' | 'captured' | 'refunded' | 'failed'
  method: string
  createdAt: Date
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// Pagination types
export interface PaginationParams {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// Filter types
export interface ProductFilters {
  category?: string
  brand?: string
  minPrice?: number
  maxPrice?: number
  sizes?: string[]
  featured?: boolean
  inStock?: boolean
}

// Search types
export interface SearchParams {
  q: string
  filters?: ProductFilters
  pagination?: PaginationParams
}

// Auth types
export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  phone?: string
  password: string
}

export interface AuthResponse {
  user: Omit<User, 'password'>
  token: string
}

// Cart context types
export interface CartContextType {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (productId: string, size: string, variantId?: string) => Promise<void>
  updateQuantity: (productId: string, size: string, quantity: number, variantId?: string) => Promise<void>
  clearCart: () => Promise<void>
  getTotal: () => number
  getItemCount: () => number
}

// Wishlist context types
export interface WishlistContextType {
  items: string[]
  addItem: (productId: string) => void
  removeItem: (productId: string) => void
  isInWishlist: (productId: string) => boolean
  clearWishlist: () => void
  getItemCount: () => number
}

// Banner types
export interface Banner extends BaseDocument {
  title: string
  subtitle?: string
  imageUrl: string
  mobileImageUrl?: string
  linkUrl?: string
  linkText?: string
  order: number
  isActive: boolean
}

// Horizontal Banner types (for scrollable banners)
export interface HorizontalBanner extends BaseDocument {
  imageUrl: string
  linkUrl?: string
  index: number
  isActive: boolean
}

// Deal types
export interface Deal extends BaseDocument {
  title: string
  description?: string
  type: 'flash' | 'daily' | 'weekly' | 'seasonal'
  discountType: 'percentage' | 'fixed'
  discountValue: number
  originalPrice?: number
  salePrice?: number
  imageUrl?: string
  linkUrl?: string
  startDate: Date
  endDate: Date
  isActive: boolean
  isFeatured: boolean
}

// Testimonial types
export interface Testimonial extends BaseDocument {
  customerName: string
  customerImage?: string
  rating: number
  comment: string
  productId?: ObjectId
  orderDate?: Date
  isActive: boolean
  isFeatured: boolean
}

// Newsletter types
export interface Newsletter extends BaseDocument {
  email: string
  status: 'active' | 'unsubscribed'
  subscribedAt: Date
  unsubscribedAt?: Date
}
