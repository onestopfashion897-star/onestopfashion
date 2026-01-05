import type { Product, Category, Brand, Order, User, Coupon, Review } from "./types"
import { ObjectId } from 'mongodb'

export const mockProducts: Product[] = [
  {
    _id: new ObjectId(),
    name: "Classic White Sneakers",
    description: "Comfortable white sneakers perfect for daily wear",
    sku: "SNK-001",
    brandId: new ObjectId(),
    categoryId: new ObjectId(),
    images: ["/placeholder.svg?height=400&width=400&text=White+Sneakers"],
    price: 2999,
    offerPrice: 2399,
    stock: 50,
    sizes: ["7", "8", "9", "10", "11"],
    tags: ["white sneakers", "casual shoes", "comfortable"],
    featured: true,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    name: "Trendy Graphic T-Shirt",
    description: "Cool graphic tee with modern design",
    sku: "TSH-001",
    brandId: new ObjectId(),
    categoryId: new ObjectId(),
    images: ["/placeholder.svg?height=400&width=400&text=Graphic+Tee"],
    price: 899,
    offerPrice: 699,
    stock: 100,
    sizes: ["S", "M", "L", "XL"],
    tags: ["graphic tee", "trendy", "casual"],
    featured: true,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    name: "Running Shoes Pro",
    description: "Professional running shoes with advanced cushioning",
    sku: "RUN-001",
    brandId: new ObjectId(),
    categoryId: new ObjectId(),
    images: ["/placeholder.svg?height=400&width=400&text=Running+Shoes"],
    price: 4999,
    offerPrice: 3999,
    stock: 30,
    sizes: ["7", "8", "9", "10", "11", "12"],
    tags: ["running shoes", "sports", "cushioning"],
    featured: false,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

export const mockCategories: Category[] = [
  {
    _id: new ObjectId(),
    name: "Footwear",
    slug: "footwear",
    description: "Footwear collection",
    image: "/placeholder.svg?height=200&width=400&text=Footwear",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    name: "Apparel",
    slug: "apparel",
    description: "Apparel collection",
    image: "/placeholder.svg?height=200&width=400&text=Apparel",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

export const mockBrands: Brand[] = [
  { _id: new ObjectId(), name: "StyleStep", slug: "stylestep", description: "StyleStep brand", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { _id: new ObjectId(), name: "TrendWear", slug: "trendwear", description: "TrendWear brand", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { _id: new ObjectId(), name: "SportMax", slug: "sportmax", description: "SportMax brand", isActive: true, createdAt: new Date(), updatedAt: new Date() },
]

export const mockOrders: Order[] = [
  {
    _id: new ObjectId(),
    orderId: "ORD-001",
    userId: new ObjectId(),
    items: [
      {
        productId: new ObjectId(),
        name: "Classic White Sneakers",
        image: "/placeholder.svg?height=100&width=100&text=Sneakers",
        size: "9",
        quantity: 1,
        price: 2399,
      },
    ],
    total: 2399,
    subtotal: 2399,
    shippingCost: 0,
    discount: 0,
    paymentMethod: "razorpay" as const,
    orderStatus: "processing" as const,
    paymentStatus: "paid" as const,
    shippingAddress: {
      id: "1",
      name: "John Doe",
      phone: "+919173803878 ",
      pincode: "110001",
      address: "123 Main Street",
      city: "Delhi",
      state: "Delhi",
      isDefault: true,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

export const mockUsers: User[] = [
  {
    _id: new ObjectId(),
    name: "John Doe",
    email: "john@example.com",
    phone: "+919173803878 ",
    password: "hashedpassword",
    role: "user" as const,
    addresses: [
      {
        id: "1",
        name: "John Doe",
        phone: "+919173803878 ",
        pincode: "110001",
        address: "123 Main Street",
        city: "Delhi",
        state: "Delhi",
        isDefault: true,
      },
    ],
    isEmailVerified: true,
    isPhoneVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

export const mockCoupons: Coupon[] = [
  {
    _id: new ObjectId(),
    code: "WELCOME20",
    description: "Welcome discount",
    type: "percentage" as const,
    value: 20,
    minAmount: 1000,
    maxDiscount: 500,
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    usageLimit: 100,
    usedCount: 25,
    status: "active" as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

export const mockReviews: Review[] = [
  {
    _id: new ObjectId(),
    productId: new ObjectId(),
    userId: new ObjectId(),
    orderId: new ObjectId(),
    rating: 5,
    comment: "Excellent quality sneakers! Very comfortable.",
    status: "approved" as const,
    helpful: 0,
    reported: false,
    verifiedPurchase: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]
