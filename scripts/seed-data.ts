import { MongoClient, ObjectId } from 'mongodb'
import bcrypt from 'bcryptjs'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/stylehub'
const DB_NAME = 'stylehub'

async function seedData() {
  const client = new MongoClient(MONGODB_URI)
  
  try {
    await client.connect()
    console.log('Connected to MongoDB')
    
    const db = client.db(DB_NAME)
    
    // Clear existing data
    await db.collection('users').deleteMany({})
    await db.collection('products').deleteMany({})
    await db.collection('categories').deleteMany({})
    await db.collection('brands').deleteMany({})
    await db.collection('admins').deleteMany({})
    await db.collection('horizontal_banners').deleteMany({})
    
    console.log('Cleared existing data')
    
    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12)
    const admin = await db.collection('admins').insertOne({
      name: 'Admin User',
      email: 'admin@stylehub.com',
      password: hashedPassword,
      role: 'super_admin',
      permissions: ['all'],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    
    console.log('Created admin user')
    
    // Create categories
    const categories = await db.collection('categories').insertMany([
      {
        name: 'Men',
        slug: 'men',
        description: 'Men\'s clothing and accessories',
        parentCategoryId: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Women',
        slug: 'women',
        description: 'Women\'s clothing and accessories',
        parentCategoryId: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Kids',
        slug: 'kids',
        description: 'Kids clothing and accessories',
        parentCategoryId: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Footwear',
        slug: 'footwear',
        description: 'Shoes, sneakers, and boots',
        parentCategoryId: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])
    
    console.log('Created categories')
    
    // Create brands
    const brands = await db.collection('brands').insertMany([
      {
        name: 'Nike',
        slug: 'nike',
        description: 'Just Do It - Athletic footwear and apparel',
        logoUrl: 'https://example.com/nike-logo.png',
        website: 'https://nike.com',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Adidas',
        slug: 'adidas',
        description: 'Impossible is Nothing - Sports equipment',
        logoUrl: 'https://example.com/adidas-logo.png',
        website: 'https://adidas.com',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Puma',
        slug: 'puma',
        description: 'Forever Faster - Athletic and casual wear',
        logoUrl: 'https://example.com/puma-logo.png',
        website: 'https://puma.com',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Levi\'s',
        slug: 'levis',
        description: 'Quality Denim - Classic jeans and denim wear',
        logoUrl: 'https://example.com/levis-logo.png',
        website: 'https://levis.com',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])
    
    console.log('Created brands')
    
    // Get category and brand IDs
    const categoryDocs = await db.collection('categories').find({}).toArray()
    const brandDocs = await db.collection('brands').find({}).toArray()
    
    const menCategory = categoryDocs.find(cat => cat.name === 'Men')
    const womenCategory = categoryDocs.find(cat => cat.name === 'Women')
    const footwearCategory = categoryDocs.find(cat => cat.name === 'Footwear')
    
    const nikeBrand = brandDocs.find(brand => brand.name === 'Nike')
    const adidasBrand = brandDocs.find(brand => brand.name === 'Adidas')
    const pumaBrand = brandDocs.find(brand => brand.name === 'Puma')
    const levisBrand = brandDocs.find(brand => brand.name === 'Levi\'s')
    
    // Validate that all categories and brands were found
    if (!menCategory || !womenCategory || !footwearCategory) {
      throw new Error('Required categories not found')
    }
    
    if (!nikeBrand || !adidasBrand || !pumaBrand || !levisBrand) {
      throw new Error('Required brands not found')
    }
    
    // Create sample products
    const products = [
      {
        name: 'Nike Air Max 270',
        description: 'Comfortable running shoes with Air Max technology. Features a breathable mesh upper and responsive Air Max cushioning for all-day comfort.',
        categoryId: footwearCategory._id,
        brandId: nikeBrand._id,
        price: 8999,
        offerPrice: 7499,
        images: [
          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop',
          'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&h=800&fit=crop'
        ],
        galleryImages: [
          'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&h=800&fit=crop',
          'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=800&h=800&fit=crop',
          'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&h=800&fit=crop'
        ],
        sizes: ['7', '8', '9', '10', '11'],
        stock: 50,
        sku: 'NK-AM270-001',
        tags: ['running', 'sports', 'comfortable'],
        isActive: true,
        featured: true,
        rating: 4.5,
        reviewCount: 128,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Adidas Ultraboost 22',
        description: 'Premium running shoes with Boost technology. Features responsive cushioning and a Primeknit upper for a sock-like fit.',
        categoryId: footwearCategory._id,
        brandId: adidasBrand._id,
        price: 12999,
        offerPrice: 10999,
        images: [
          'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&h=800&fit=crop',
          'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=800&h=800&fit=crop'
        ],
        galleryImages: [
          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop',
          'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&h=800&fit=crop',
          'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&h=800&fit=crop'
        ],
        sizes: ['7', '8', '9', '10', '11'],
        stock: 30,
        sku: 'AD-UB22-001',
        tags: ['running', 'premium', 'boost'],
        isActive: true,
        featured: true,
        rating: 4.8,
        reviewCount: 95,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Levi\'s 501 Original Jeans',
        description: 'Classic straight-fit jeans with timeless style. Made from premium denim with perfect fit and durability.',
        categoryId: menCategory._id,
        brandId: levisBrand._id,
        price: 3999,
        offerPrice: 2999,
        images: [
          'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&h=800&fit=crop',
          'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&h=800&fit=crop'
        ],
        galleryImages: [
          'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&h=800&fit=crop',
          'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&h=800&fit=crop',
          'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&h=800&fit=crop'
        ],
        sizes: ['30', '32', '34', '36', '38'],
        stock: 100,
        sku: 'LV-501-001',
        tags: ['jeans', 'classic', 'denim'],
        isActive: true,
        featured: false,
        rating: 4.3,
        reviewCount: 256,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Puma RS-X Reinvention',
        description: 'Retro-inspired sneakers with bold design and chunky sole. Perfect for street style and casual wear.',
        categoryId: footwearCategory._id,
        brandId: pumaBrand._id,
        price: 7999,
        offerPrice: 5999,
        images: [
          'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=800&h=800&fit=crop',
          'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&h=800&fit=crop'
        ],
        galleryImages: [
          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop',
          'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&h=800&fit=crop',
          'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=800&h=800&fit=crop'
        ],
        sizes: ['6', '7', '8', '9', '10'],
        stock: 40,
        sku: 'PM-RSX-001',
        tags: ['retro', 'stylish', 'comfortable'],
        isActive: true,
        featured: true,
        rating: 4.2,
        reviewCount: 78,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Nike Dri-FIT Training T-Shirt',
        description: 'Moisture-wicking training shirt with breathable fabric. Perfect for workouts and athletic activities.',
        categoryId: menCategory._id,
        brandId: nikeBrand._id,
        price: 1999,
        offerPrice: 1499,
        images: [
          'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop',
          'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&h=800&fit=crop'
        ],
        galleryImages: [
          'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop',
          'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&h=800&fit=crop',
          'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop'
        ],
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        stock: 75,
        sku: 'NK-DFT-001',
        tags: ['training', 'moisture-wicking', 'comfortable'],
        isActive: true,
        featured: false,
        rating: 4.1,
        reviewCount: 142,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Adidas Originals Trefoil Hoodie',
        description: 'Classic hoodie with Trefoil logo. Made from soft cotton blend for ultimate comfort and style.',
        categoryId: womenCategory._id,
        brandId: adidasBrand._id,
        price: 3499,
        offerPrice: 2799,
        images: [
          'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=800&fit=crop',
          'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=800&fit=crop'
        ],
        galleryImages: [
          'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=800&fit=crop',
          'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=800&fit=crop',
          'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=800&fit=crop'
        ],
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        stock: 60,
        sku: 'AD-TRH-001',
        tags: ['hoodie', 'casual', 'warm'],
        isActive: true,
        featured: true,
        rating: 4.4,
        reviewCount: 89,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Puma Softride Enzo NXT',
        description: 'Comfortable walking shoes with soft cushioning. Perfect for daily wear and light activities.',
        categoryId: footwearCategory._id,
        brandId: pumaBrand._id,
        price: 5999,
        offerPrice: 4499,
        images: [
          'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&h=800&fit=crop',
          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop'
        ],
        galleryImages: [
          'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&h=800&fit=crop',
          'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=800&h=800&fit=crop',
          'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&h=800&fit=crop'
        ],
        sizes: ['7', '8', '9', '10', '11'],
        stock: 35,
        sku: 'PM-SEN-001',
        tags: ['walking', 'comfortable', 'casual'],
        isActive: true,
        featured: false,
        rating: 4.0,
        reviewCount: 67,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Levi\'s Women\'s 721 High Rise Skinny Jeans',
        description: 'High-rise skinny jeans for women with stretch denim. Flattering fit with modern styling.',
        categoryId: womenCategory._id,
        brandId: levisBrand._id,
        price: 4499,
        offerPrice: 3599,
        images: [
          'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&h=800&fit=crop',
          'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&h=800&fit=crop'
        ],
        galleryImages: [
          'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&h=800&fit=crop',
          'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&h=800&fit=crop',
          'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&h=800&fit=crop'
        ],
        sizes: ['26', '28', '30', '32', '34'],
        stock: 80,
        sku: 'LV-721-001',
        tags: ['jeans', 'skinny', 'high-rise'],
        isActive: true,
        featured: false,
        rating: 4.6,
        reviewCount: 203,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]
    
    await db.collection('products').insertMany(products)
    console.log('Created products')
    
    // Create sample user
    const userPassword = await bcrypt.hash('user123', 12)
    const user = await db.collection('users').insertOne({
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+919173803878

 ',
      password: userPassword,
      role: 'user',
      addresses: [
        {
          id: '1',
          name: 'John Doe',
          phone: '+919173803878

 ',
          address: '123 Main Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          isDefault: true,
        },
      ],
      isEmailVerified: true,
      isPhoneVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    
    console.log('Created sample user')
    
    // Create horizontal banners
    const horizontalBanners = [
      {
        imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=400&fit=crop',
        linkUrl: '/products?category=footwear',
        index: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&h=400&fit=crop',
        linkUrl: '/products?featured=true',
        index: 2,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=1200&h=400&fit=crop',
        linkUrl: '/products?category=men',
        index: 3,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&h=400&fit=crop',
        linkUrl: '/products?category=women',
        index: 4,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]
    
    await db.collection('horizontal_banners').insertMany(horizontalBanners)
    console.log('Created horizontal banners')
    
    console.log('✅ Database seeded successfully!')
    console.log('\n📋 Login Credentials:')
    console.log('Admin: admin@stylehub.com / admin123')
    console.log('User: john@example.com / user123')
    
  } catch (error) {
    console.error('Error seeding data:', error)
  } finally {
    await client.close()
  }
}

// Run the seed function
seedData()