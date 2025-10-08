import clientPromise from './mongodb'
import { 
  User, 
  Product, 
  Category, 
  Brand, 
  Order, 
  Review, 
  Wishlist, 
  Coupon, 
  Admin, 
  ContactQuery,
  PaginationParams,
  ProductFilters,
  Cart,
  CartItem,
  HorizontalBanner
} from './types'
import { ObjectId } from 'mongodb'

// Database name
const DB_NAME = 'stylehub'

// Collection names
const COLLECTIONS = {
  USERS: 'users',
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  BRANDS: 'brands',
  ORDERS: 'orders',
  REVIEWS: 'reviews',
  WISHLISTS: 'wishlists',
  CARTS: 'carts',
  COUPONS: 'coupons',
  ADMINS: 'admins',

  CONTACT_QUERIES: 'contact_queries',
  BANNERS: 'banners',
  HORIZONTAL_BANNERS: 'horizontal_banners'
} as const

// Generic database operations
export class DatabaseService {
  private static async getCollection(collectionName: string) {
    try {
      const client = await clientPromise
      const db = client.db(DB_NAME)
      return db.collection(collectionName)
    } catch (error) {
      console.error('MongoDB connection error:', error)
      throw new Error('Database connection failed. Please check your MongoDB configuration.')
    }
  }

  // Generic CRUD operations
  static async create<T>(collectionName: string, data: Omit<T, '_id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    const collection = await this.getCollection(collectionName)
    const now = new Date()
    const document = {
      ...data,
      createdAt: now,
      updatedAt: now
    }
    const result = await collection.insertOne(document)
    return { ...document, _id: result.insertedId } as T
  }

  static async findById<T>(collectionName: string, id: string | ObjectId): Promise<T | null> {
    const collection = await this.getCollection(collectionName)
    const _id = typeof id === 'string' ? new ObjectId(id) : id
    return collection.findOne({ _id }) as Promise<T | null>
  }

  static async findOne<T>(collectionName: string, filter: any): Promise<T | null> {
    const collection = await this.getCollection(collectionName)
    return collection.findOne(filter) as Promise<T | null>
  }

  static async find<T>(
    collectionName: string, 
    filter: any = {}, 
    pagination?: PaginationParams
  ): Promise<T[]> {
    const collection = await this.getCollection(collectionName)
    let query = collection.find(filter)
    
    if (pagination) {
      const { page, limit, sortBy, sortOrder } = pagination
      const skip = (page - 1) * limit
      
      if (sortBy) {
        const sortDirection = sortOrder === 'desc' ? -1 : 1
        query = query.sort({ [sortBy]: sortDirection })
      }
      
      query = query.skip(skip).limit(limit)
    }
    
    return query.toArray() as Promise<T[]>
  }

  static async update<T>(
    collectionName: string, 
    id: string | ObjectId, 
    data: Partial<T>
  ): Promise<boolean> {
    const collection = await this.getCollection(collectionName)
    const _id = typeof id === 'string' ? new ObjectId(id) : id
    const result = await collection.updateOne(
      { _id },
      { 
        $set: { 
          ...data, 
          updatedAt: new Date() 
        } 
      }
    )
    return result.modifiedCount > 0
  }

  static async delete(collectionName: string, id: string | ObjectId): Promise<boolean> {
    const collection = await this.getCollection(collectionName)
    const _id = typeof id === 'string' ? new ObjectId(id) : id
    const result = await collection.deleteOne({ _id })
    return result.deletedCount > 0
  }

  static async count(collectionName: string, filter: any = {}): Promise<number> {
    const collection = await this.getCollection(collectionName)
    return collection.countDocuments(filter)
  }

  static async aggregate<T>(collectionName: string, pipeline: any[]): Promise<T[]> {
    const collection = await this.getCollection(collectionName)
    return collection.aggregate(pipeline).toArray() as Promise<T[]>
  }
}

// User operations
export class UserService {
  static async createUser(userData: Omit<User, '_id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    return DatabaseService.create<User>(COLLECTIONS.USERS, userData)
  }

  static async findByEmail(email: string): Promise<User | null> {
    return DatabaseService.findOne<User>(COLLECTIONS.USERS, { email })
  }

  static async findById(id: string): Promise<User | null> {
    return DatabaseService.findById<User>(COLLECTIONS.USERS, id)
  }

  static async updateUser(id: string, data: Partial<User>): Promise<boolean> {
    return DatabaseService.update<User>(COLLECTIONS.USERS, id, data)
  }
}

// Product operations
export class ProductService {
  static async createProduct(productData: Omit<Product, '_id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    return DatabaseService.create<Product>(COLLECTIONS.PRODUCTS, productData)
  }

  static async findById(id: string): Promise<Product | null> {
    return DatabaseService.findById<Product>(COLLECTIONS.PRODUCTS, id)
  }

  static async findByIdWithRelations(id: string): Promise<Product | null> {
    const _id = new ObjectId(id)
    
    const pipeline = [
      { $match: { _id } },
      {
        $lookup: {
          from: COLLECTIONS.CATEGORIES,
          localField: 'categoryId',
          foreignField: '_id',
          as: 'category'
        }
      },
      {
        $lookup: {
          from: COLLECTIONS.BRANDS,
          localField: 'brandId',
          foreignField: '_id',
          as: 'brand'
        }
      },
      {
        $addFields: {
          category: { $arrayElemAt: ['$category', 0] },
          brand: { $arrayElemAt: ['$brand', 0] }
        }
      }
    ]
    
    const products = await DatabaseService.aggregate<Product>(COLLECTIONS.PRODUCTS, pipeline)
    return products[0] || null
  }

  static async findProducts(
    filters: ProductFilters = {}, 
    pagination?: PaginationParams
  ): Promise<Product[]> {
    const filter: any = { isActive: true }
    
    if (filters.category) filter.categoryId = filters.category
    if (filters.brand) filter.brandId = filters.brand
    if (filters.featured !== undefined) filter.featured = filters.featured
    if (filters.inStock) filter.stock = { $gt: 0 }
    
    if (filters.minPrice || filters.maxPrice) {
      filter.price = {}
      if (filters.minPrice) filter.price.$gte = filters.minPrice
      if (filters.maxPrice) filter.price.$lte = filters.maxPrice
    }

    return DatabaseService.find<Product>(COLLECTIONS.PRODUCTS, filter, pagination)
  }

  static async findProductsWithRelations(
    filters: ProductFilters = {}, 
    pagination?: PaginationParams
  ): Promise<Product[]> {
    const matchStage: any = { isActive: true }
    
    if (filters.category) matchStage.categoryId = new ObjectId(filters.category)
    if (filters.brand) matchStage.brandId = new ObjectId(filters.brand)
    if (filters.featured !== undefined) matchStage.featured = filters.featured
    if (filters.inStock) matchStage.stock = { $gt: 0 }
    
    if (filters.minPrice || filters.maxPrice) {
      matchStage.price = {}
      if (filters.minPrice) matchStage.price.$gte = filters.minPrice
      if (filters.maxPrice) matchStage.price.$lte = filters.maxPrice
    }

    // Add sizes filter
    if (filters.sizes && filters.sizes.length > 0) {
      matchStage.sizes = { $in: filters.sizes }
    }

    const pipeline: any[] = [
      { $match: matchStage },
      {
        $lookup: {
          from: COLLECTIONS.CATEGORIES,
          localField: 'categoryId',
          foreignField: '_id',
          as: 'category'
        }
      },
      {
        $lookup: {
          from: COLLECTIONS.BRANDS,
          localField: 'brandId',
          foreignField: '_id',
          as: 'brand'
        }
      },
      {
        $addFields: {
          category: { $arrayElemAt: ['$category', 0] },
          brand: { $arrayElemAt: ['$brand', 0] }
        }
      }
    ]

    if (pagination) {
      const { page, limit, sortBy, sortOrder } = pagination
      const skip = (page - 1) * limit
      
      if (sortBy) {
        const sortDirection = sortOrder === 'desc' ? -1 : 1
        pipeline.push({ $sort: { [sortBy]: sortDirection } })
      }
      
      pipeline.push({ $skip: skip }, { $limit: limit })
    }

    return DatabaseService.aggregate<Product>(COLLECTIONS.PRODUCTS, pipeline)
  }

  static async searchProducts(query: string, pagination?: PaginationParams): Promise<Product[]> {
    const pipeline: any[] = [
      {
        $match: {
          isActive: true,
          $or: [
            { name: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } },
            { sku: { $regex: query, $options: 'i' } },
            { tags: { $in: [new RegExp(query, 'i')] } }
          ]
        }
      },
      {
        $lookup: {
          from: 'brands',
          localField: 'brandId',
          foreignField: '_id',
          as: 'brand'
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'category'
        }
      },
      {
        $addFields: {
          brand: { $arrayElemAt: ['$brand', 0] },
          category: { $arrayElemAt: ['$category', 0] }
        }
      },
      {
        $match: {
          $or: [
            { name: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } },
            { sku: { $regex: query, $options: 'i' } },
            { tags: { $in: [new RegExp(query, 'i')] } },
            { 'brand.name': { $regex: query, $options: 'i' } },
            { 'category.name': { $regex: query, $options: 'i' } }
          ]
        }
      }
    ]

    // Add pagination
    if (pagination) {
      const skip = (pagination.page - 1) * pagination.limit
      pipeline.push({ $skip: skip })
      pipeline.push({ $limit: pagination.limit })
      
      if (pagination.sortBy) {
        const sortOrder = pagination.sortOrder === 'desc' ? -1 : 1
        pipeline.push({ $sort: { [pagination.sortBy]: sortOrder } })
      }
    }

    return DatabaseService.aggregate<Product>(COLLECTIONS.PRODUCTS, pipeline)
  }

  static async updateProduct(id: string, data: Partial<Product>): Promise<boolean> {
    return DatabaseService.update<Product>(COLLECTIONS.PRODUCTS, id, data)
  }

  static async deleteProduct(id: string): Promise<boolean> {
    return DatabaseService.delete(COLLECTIONS.PRODUCTS, id)
  }

  static async getFeaturedProducts(): Promise<Product[]> {
    return DatabaseService.find<Product>(COLLECTIONS.PRODUCTS, { 
      featured: true, 
      isActive: true 
    })
  }

  static async getProductsByCategory(categoryId: string): Promise<Product[]> {
    return DatabaseService.find<Product>(COLLECTIONS.PRODUCTS, { 
      categoryId, 
      isActive: true 
    })
  }
}

// Order operations
export class OrderService {
  static async createOrder(orderData: Omit<Order, '_id' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    return DatabaseService.create<Order>(COLLECTIONS.ORDERS, orderData)
  }

  static async findById(id: string): Promise<Order | null> {
    return DatabaseService.findById<Order>(COLLECTIONS.ORDERS, id)
  }

  static async findByIdWithProductDetails(id: string): Promise<Order | null> {
    const pipeline: any[] = [
      { $match: { _id: new ObjectId(id) } },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      {
        $addFields: {
          items: {
            $map: {
              input: '$items',
              as: 'item',
              in: {
                $mergeObjects: [
                  '$$item',
                  {
                    $let: {
                      vars: {
                        product: {
                          $arrayElemAt: [
                            {
                              $filter: {
                                input: '$productDetails',
                                cond: { $eq: ['$$this._id', '$$item.productId'] }
                              }
                            },
                            0
                          ]
                        }
                      },
                      in: {
                        name: { $ifNull: ['$$item.name', '$$product.name'] },
                        image: { $ifNull: ['$$item.image', { $arrayElemAt: ['$$product.images', 0] }] }
                      }
                    }
                  }
                ]
              }
            }
          }
        }
      },
      { $project: { productDetails: 0 } }
    ]

    const orders = await DatabaseService.aggregate<Order>(COLLECTIONS.ORDERS, pipeline)
    return orders[0] || null
  }

  static async findByOrderId(orderId: string): Promise<Order | null> {
    return DatabaseService.findOne<Order>(COLLECTIONS.ORDERS, { orderId })
  }

  static async findUserOrders(userId: string, pagination?: PaginationParams): Promise<Order[]> {
    return DatabaseService.find<Order>(
      COLLECTIONS.ORDERS, 
      { userId: new ObjectId(userId) }, 
      pagination
    )
  }

  static async findUserOrdersWithProductDetails(userId: string, pagination?: PaginationParams): Promise<Order[]> {
    // First get the orders
    const orders = await DatabaseService.find<Order>(
      COLLECTIONS.ORDERS, 
      { userId: new ObjectId(userId) }, 
      pagination
    )

    // Get all unique product IDs from all orders
    const productIds = new Set<string>()
    orders.forEach(order => {
      order.items.forEach(item => {
        if (item.productId) {
          productIds.add(item.productId.toString())
        }
      })
    })

    // Fetch all products at once
    const products = await DatabaseService.find<Product>(
      COLLECTIONS.PRODUCTS,
      { _id: { $in: Array.from(productIds).map(id => new ObjectId(id)) } }
    )

    // Create a map for quick product lookup
    const productMap = new Map<string, Product>()
    products.forEach(product => {
      productMap.set(product._id!.toString(), product)
    })

    // Populate product details in order items
     const ordersWithDetails = orders.map(order => ({
       ...order,
       items: order.items.map(item => {
         const product = productMap.get(item.productId.toString())
         return {
           ...item,
           name: item.name || product?.name || 'Unknown Product',
           image: item.image || product?.images?.[0] || ''
         }
       })
     }))

    return ordersWithDetails.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }

  static async updateOrderStatus(id: string, status: Order['orderStatus']): Promise<boolean> {
    return DatabaseService.update<Order>(COLLECTIONS.ORDERS, id, { orderStatus: status })
  }

  static async updatePaymentStatus(id: string, status: Order['paymentStatus']): Promise<boolean> {
    return DatabaseService.update<Order>(COLLECTIONS.ORDERS, id, { paymentStatus: status })
  }

  static async getOrders(filter: any = {}, pagination?: PaginationParams): Promise<Order[]> {
    return DatabaseService.find<Order>(COLLECTIONS.ORDERS, filter, pagination)
  }

  static async getOrdersWithProductDetails(filter: any = {}, pagination?: PaginationParams): Promise<Order[]> {
    const pipeline: any[] = [
      { $match: filter },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      {
        $addFields: {
          items: {
            $map: {
              input: '$items',
              as: 'item',
              in: {
                $mergeObjects: [
                  '$$item',
                  {
                    $let: {
                      vars: {
                        product: {
                          $arrayElemAt: [
                            {
                              $filter: {
                                input: '$productDetails',
                                cond: { $eq: ['$$this._id', '$$item.productId'] }
                              }
                            },
                            0
                          ]
                        }
                      },
                      in: {
                        name: { $ifNull: ['$$item.name', '$$product.name'] },
                        image: { $ifNull: ['$$item.image', { $arrayElemAt: ['$$product.images', 0] }] }
                      }
                    }
                  }
                ]
              }
            }
          },
          user: { $arrayElemAt: ['$userDetails', 0] }
        }
      },
      { $project: { productDetails: 0, userDetails: 0 } }
    ]

    if (pagination) {
      const { page, limit, sortBy, sortOrder } = pagination
      const skip = (page - 1) * limit
      
      if (sortBy) {
        const sortDirection = sortOrder === 'desc' ? -1 : 1
        pipeline.push({ $sort: { [sortBy]: sortDirection } })
      } else {
        pipeline.push({ $sort: { createdAt: -1 } }) // Default sort by newest first
      }
      
      pipeline.push({ $skip: skip })
      pipeline.push({ $limit: limit })
    } else {
      pipeline.push({ $sort: { createdAt: -1 } })
    }

    return DatabaseService.aggregate<Order>(COLLECTIONS.ORDERS, pipeline)
  }

  static async updateTrackingNumber(orderId: string, trackingNumber: string): Promise<boolean> {
    return DatabaseService.update<Order>(COLLECTIONS.ORDERS, orderId, {
      trackingNumber,
      updatedAt: new Date()
    })
  }

  static async updateOrderNotes(orderId: string, notes: string): Promise<boolean> {
    return DatabaseService.update<Order>(COLLECTIONS.ORDERS, orderId, {
      notes,
      updatedAt: new Date()
    })
  }

  static async getOrderById(orderId: string): Promise<Order | null> {
    return DatabaseService.findById<Order>(COLLECTIONS.ORDERS, orderId)
  }
}

// Category operations
export class CategoryService {
  static async createCategory(categoryData: Omit<Category, '_id' | 'createdAt' | 'updatedAt'>): Promise<Category> {
    return DatabaseService.create<Category>(COLLECTIONS.CATEGORIES, categoryData)
  }

  static async findById(id: string): Promise<Category | null> {
    return DatabaseService.findById<Category>(COLLECTIONS.CATEGORIES, id)
  }

  static async findBySlug(slug: string): Promise<Category | null> {
    return DatabaseService.findOne<Category>(COLLECTIONS.CATEGORIES, { slug })
  }

  static async getAllCategories(): Promise<Category[]> {
    return DatabaseService.find<Category>(COLLECTIONS.CATEGORIES, { status: 'active' })
  }

  static async getMainCategories(): Promise<Category[]> {
    return DatabaseService.find<Category>(COLLECTIONS.CATEGORIES, { 
      status: 'active',
      parentId: { $exists: false }
    })
  }
}

// Brand operations
export class BrandService {
  static async createBrand(brandData: Omit<Brand, '_id' | 'createdAt' | 'updatedAt'>): Promise<Brand> {
    return DatabaseService.create<Brand>(COLLECTIONS.BRANDS, brandData)
  }

  static async findById(id: string): Promise<Brand | null> {
    return DatabaseService.findById<Brand>(COLLECTIONS.BRANDS, id)
  }

  static async getAllBrands(): Promise<Brand[]> {
    return DatabaseService.find<Brand>(COLLECTIONS.BRANDS, { status: 'active' })
  }
}

// Review operations
export class ReviewService {
  static async createReview(reviewData: Omit<Review, '_id' | 'createdAt' | 'updatedAt'>): Promise<Review> {
    return DatabaseService.create<Review>(COLLECTIONS.REVIEWS, reviewData)
  }

  static async getProductReviews(productId: string, approvedOnly: boolean = true): Promise<Review[]> {
    const filter: any = { productId: new ObjectId(productId) }
    if (approvedOnly) {
      filter.status = 'approved'
    }
    return DatabaseService.find<Review>(COLLECTIONS.REVIEWS, filter, {
      page: 1,
      limit: 100,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    })
  }

  static async getUserReviews(userId: string): Promise<Review[]> {
    return DatabaseService.find<Review>(COLLECTIONS.REVIEWS, {
      userId: new ObjectId(userId)
    }, {
      page: 1,
      limit: 100,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    })
  }

  static async getReviewByOrderAndProduct(orderId: string, productId: string, userId: string): Promise<Review | null> {
    return DatabaseService.findOne<Review>(COLLECTIONS.REVIEWS, {
      orderId: new ObjectId(orderId),
      productId: new ObjectId(productId),
      userId: new ObjectId(userId)
    })
  }

  static async getAllReviews(pagination?: PaginationParams): Promise<Review[]> {
    return DatabaseService.find<Review>(COLLECTIONS.REVIEWS, {}, pagination)
  }

  static async updateReviewStatus(id: string, status: Review['status'], adminResponse?: string): Promise<boolean> {
    const updateData: any = { status }
    if (adminResponse) {
      updateData.adminResponse = adminResponse
      updateData.adminResponseAt = new Date()
    }
    return DatabaseService.update<Review>(COLLECTIONS.REVIEWS, id, updateData)
  }

  static async getReviewById(id: string): Promise<Review | null> {
    return DatabaseService.findById<Review>(COLLECTIONS.REVIEWS, id)
  }

  static async updateReview(id: string, data: Partial<Review>): Promise<boolean> {
    const updateData = {
      ...data,
      updatedAt: new Date()
    }
    return DatabaseService.update<Review>(COLLECTIONS.REVIEWS, id, updateData)
  }

  static async getUserProductReview(userId: string, productId: string): Promise<Review | null> {
    return DatabaseService.findOne<Review>(COLLECTIONS.REVIEWS, {
      userId: new ObjectId(userId),
      productId: new ObjectId(productId)
    })
  }

  static async deleteReview(id: string): Promise<boolean> {
    return DatabaseService.delete(COLLECTIONS.REVIEWS, id)
  }

  static async verifyPurchaseForReview(userId: string, productId: string): Promise<{ canReview: boolean; orderId?: string }> {
    // First check if user has already reviewed this product (one review per user per product)
    const existingUserReview = await this.getUserProductReview(userId, productId)
    if (existingUserReview) {
      return { canReview: false }
    }

    // Check if user has purchased this product and it's delivered
    const orders = await DatabaseService.find<Order>(COLLECTIONS.ORDERS, {
      userId: new ObjectId(userId),
      orderStatus: 'delivered'
    })

    for (const order of orders) {
      const hasProduct = order.items.some(item => 
        item.productId.toString() === productId
      )
      if (hasProduct) {
        return { canReview: true, orderId: order._id!.toString() }
      }
    }

    return { canReview: false }
  }

  static async getReviewStats(productId: string): Promise<{ averageRating: number; totalReviews: number; ratingDistribution: Record<number, number> }> {
    const reviews = await this.getProductReviews(productId, true)
    
    if (reviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      }
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
    const averageRating = totalRating / reviews.length
    
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    reviews.forEach(review => {
      ratingDistribution[review.rating as keyof typeof ratingDistribution]++
    })

    return {
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: reviews.length,
      ratingDistribution
    }
  }
}

// Wishlist operations
export class WishlistService {
  static async addToWishlist(userId: string, productId: string): Promise<Wishlist> {
    return DatabaseService.create<Wishlist>(COLLECTIONS.WISHLISTS, {
      userId: new ObjectId(userId),
      productId: new ObjectId(productId)
    })
  }

  static async removeFromWishlist(userId: string, productId: string): Promise<boolean> {
    const wishlist = await DatabaseService.findOne<Wishlist>(COLLECTIONS.WISHLISTS, {
      userId: new ObjectId(userId),
      productId: new ObjectId(productId)
    })
    
    if (wishlist && wishlist._id) {
      return DatabaseService.delete(COLLECTIONS.WISHLISTS, wishlist._id.toString())
    }
    
    return false
  }

  static async getUserWishlist(userId: string): Promise<string[]> {
    const wishlist = await DatabaseService.find<Wishlist>(COLLECTIONS.WISHLISTS, { 
      userId: new ObjectId(userId) 
    })
    return wishlist.map(item => item.productId.toString())
  }

  static async isInWishlist(userId: string, productId: string): Promise<boolean> {
    const wishlist = await DatabaseService.findOne<Wishlist>(COLLECTIONS.WISHLISTS, {
      userId: new ObjectId(userId),
      productId: new ObjectId(productId)
    })
    return !!wishlist
  }
}

// Coupon operations
export class CouponService {
  static async createCoupon(couponData: Omit<Coupon, '_id' | 'createdAt' | 'updatedAt'>): Promise<Coupon> {
    return DatabaseService.create<Coupon>(COLLECTIONS.COUPONS, couponData)
  }

  static async findByCode(code: string): Promise<Coupon | null> {
    return DatabaseService.findOne<Coupon>(COLLECTIONS.COUPONS, { 
      code: code.toUpperCase(),
      isActive: true,
      validFrom: { $lte: new Date() },
      validUntil: { $gte: new Date() }
    })
  }

  static async validateCoupon(code: string, amount: number): Promise<{ valid: boolean; coupon?: Coupon; error?: string }> {
    const coupon = await this.findByCode(code)
    
    if (!coupon) {
      return { valid: false, error: 'Invalid coupon code' }
    }

    if (amount < coupon.minAmount) {
      return { valid: false, error: `Minimum order amount is ₹${coupon.minAmount}` }
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      return { valid: false, error: 'Coupon usage limit exceeded' }
    }

    return { valid: true, coupon }
  }
}

// Admin operations
export class AdminService {
  static async createAdmin(adminData: Omit<Admin, '_id' | 'createdAt' | 'updatedAt'>): Promise<Admin> {
    return DatabaseService.create<Admin>(COLLECTIONS.ADMINS, adminData)
  }

  static async findByEmail(email: string): Promise<Admin | null> {
    return DatabaseService.findOne<Admin>(COLLECTIONS.ADMINS, { email, isActive: true })
  }
}

// Contact Query operations
export class ContactQueryService {
  static async createQuery(queryData: Omit<ContactQuery, '_id' | 'createdAt' | 'updatedAt'>): Promise<ContactQuery> {
    return DatabaseService.create<ContactQuery>(COLLECTIONS.CONTACT_QUERIES, queryData)
  }

  static async getAllQueries(pagination?: PaginationParams): Promise<ContactQuery[]> {
    return DatabaseService.find<ContactQuery>(COLLECTIONS.CONTACT_QUERIES, {}, pagination)
  }

  static async updateQueryStatus(id: string, status: ContactQuery['status']): Promise<boolean> {
    return DatabaseService.update<ContactQuery>(COLLECTIONS.CONTACT_QUERIES, id, { status })
  }
}



// Cart operations
export class CartService {
  static async getOrCreateCart(userId: string): Promise<Cart> {
    let cart = await DatabaseService.findOne<Cart>(COLLECTIONS.CARTS, { 
      userId: new ObjectId(userId) 
    })
    
    if (!cart) {
      cart = await DatabaseService.create<Cart>(COLLECTIONS.CARTS, {
        userId: new ObjectId(userId),
        items: [],
        total: 0,
        itemCount: 0
      })
    }
    
    return cart
  }

  static async addItem(userId: string, item: CartItem): Promise<Cart> {
    const cart = await this.getOrCreateCart(userId)
    
    // Check if item already exists in cart (including variant)
    const existingItemIndex = cart.items.findIndex(
      cartItem => cartItem.productId.toString() === item.productId && 
                  cartItem.size === item.size &&
                  cartItem.variantId === item.variantId
    )
    
    if (existingItemIndex > -1) {
      // Update quantity if item exists
      cart.items[existingItemIndex].quantity += item.quantity
    } else {
      // Add new item
      cart.items.push({
        productId: new ObjectId(item.productId),
        name: item.name,
        price: item.price,
        offerPrice: item.offerPrice,
        quantity: item.quantity,
        size: item.size,
        image: item.image,
        stock: item.stock,
        variantId: item.variantId,
        variantName: item.variantName,
        variantType: item.variantType
      })
    }
    
    // Recalculate totals
    cart.total = cart.items.reduce((sum, cartItem) => {
      const price = cartItem.offerPrice || cartItem.price
      return sum + (price * cartItem.quantity)
    }, 0)
    cart.itemCount = cart.items.reduce((sum, cartItem) => sum + cartItem.quantity, 0)
    
    await DatabaseService.update<Cart>(COLLECTIONS.CARTS, cart._id!, {
      items: cart.items,
      total: cart.total,
      itemCount: cart.itemCount
    })
    
    return cart
  }

  static async updateItemQuantity(userId: string, productId: string, size: string, quantity: number, variantId?: string): Promise<Cart> {
    const cart = await this.getOrCreateCart(userId)
    
    const itemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId && 
              item.size === size &&
              item.variantId === variantId
    )
    
    if (itemIndex === -1) {
      throw new Error('Item not found in cart')
    }
    
    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      cart.items.splice(itemIndex, 1)
    } else {
      // Update quantity
      cart.items[itemIndex].quantity = quantity
    }
    
    // Recalculate totals
    cart.total = cart.items.reduce((sum, item) => {
      const price = item.offerPrice || item.price
      return sum + (price * item.quantity)
    }, 0)
    cart.itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0)
    
    await DatabaseService.update<Cart>(COLLECTIONS.CARTS, cart._id!, {
      items: cart.items,
      total: cart.total,
      itemCount: cart.itemCount
    })
    
    return cart
  }

  static async removeItem(userId: string, productId: string, size: string, variantId?: string): Promise<Cart> {
    const cart = await this.getOrCreateCart(userId)
    
    cart.items = cart.items.filter(
      item => !(item.productId.toString() === productId && 
                item.size === size &&
                item.variantId === variantId)
    )
    
    // Recalculate totals
    cart.total = cart.items.reduce((sum, item) => {
      const price = item.offerPrice || item.price
      return sum + (price * item.quantity)
    }, 0)
    cart.itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0)
    
    await DatabaseService.update<Cart>(COLLECTIONS.CARTS, cart._id!, {
      items: cart.items,
      total: cart.total,
      itemCount: cart.itemCount
    })
    
    return cart
  }

  static async clearCart(userId: string): Promise<Cart> {
    const cart = await this.getOrCreateCart(userId)
    
    await DatabaseService.update<Cart>(COLLECTIONS.CARTS, cart._id!, {
      items: [],
      total: 0,
      itemCount: 0
    })
    
    return {
      ...cart,
      items: [],
      total: 0,
      itemCount: 0
    }
  }

  static async getUserCart(userId: string): Promise<Cart> {
    return this.getOrCreateCart(userId)
  }
}

// Horizontal Banner operations
export class HorizontalBannerService {
  static async createBanner(bannerData: Omit<HorizontalBanner, '_id' | 'createdAt' | 'updatedAt'>): Promise<HorizontalBanner> {
    return DatabaseService.create<HorizontalBanner>(COLLECTIONS.HORIZONTAL_BANNERS, bannerData)
  }

  static async getAllBanners(activeOnly: boolean = false): Promise<HorizontalBanner[]> {
    const filter = activeOnly ? { isActive: true } : {}
    return DatabaseService.find<HorizontalBanner>(COLLECTIONS.HORIZONTAL_BANNERS, filter, {
      page: 1,
      limit: 1000,
      sortBy: 'index',
      sortOrder: 'asc'
    })
  }

  static async getBannerById(id: string): Promise<HorizontalBanner | null> {
    return DatabaseService.findById<HorizontalBanner>(COLLECTIONS.HORIZONTAL_BANNERS, id)
  }

  static async updateBanner(id: string, data: Partial<HorizontalBanner>): Promise<boolean> {
    return DatabaseService.update<HorizontalBanner>(COLLECTIONS.HORIZONTAL_BANNERS, id, data)
  }

  static async deleteBanner(id: string): Promise<boolean> {
    return DatabaseService.delete(COLLECTIONS.HORIZONTAL_BANNERS, id)
  }

  static async reorderBanners(bannerIds: string[]): Promise<boolean> {
    try {
      for (let i = 0; i < bannerIds.length; i++) {
        await this.updateBanner(bannerIds[i], { index: i + 1 })
      }
      return true
    } catch (error) {
      console.error('Error reordering banners:', error)
      return false
    }
  }
}