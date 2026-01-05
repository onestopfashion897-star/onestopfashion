"use client"

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Plus, Edit, Trash2, Search, Filter, Loader2, Image as ImageIcon, Eye, Upload, X } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { ImageCropper } from '@/components/ui/image-cropper'

interface ProductVariant {
  id: string
  name: string
  type: 'color' | 'model'
  value: string
  images: string[]
  price?: number
  offerPrice?: number
  stock: number
  sizeStocks?: SizeStock[]
  sku: string
  isActive: boolean
}

interface Product {
  _id: string
  name: string
  description: string
  categoryId: string
  brandId: string
  price: number
  offerPrice?: number
  stock: number
  sku: string
  sizes: string[]
  sizeStocks?: SizeStock[]
  variants?: ProductVariant[]
  hasVariants: boolean
  tags: string[]
  images: string[]
  isActive: boolean
  featured: boolean
  rating?: number
  reviewCount?: number
  createdAt: string
  updatedAt: string
  category?: { name: string }
  brand?: { name: string }
}

interface Category {
  _id: string
  name: string
}

interface Brand {
  _id: string
  name: string
}

interface SizeStock {
  size: string
  stock: number
}

export default function ProductsPage() {
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedBrand, setSelectedBrand] = useState('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [sizeStocks, setSizeStocks] = useState<SizeStock[]>([])
  const [newSize, setNewSize] = useState('')
  const [newStock, setNewStock] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [newVariant, setNewVariant] = useState({
    name: '',
    type: 'color' as 'color' | 'model',
    value: '',
    images: [] as string[],
    price: 0,
    offerPrice: 0,
    stock: 0,
    sizeStocks: [] as SizeStock[],
    sku: '',
    isActive: true
  })
  
  // Image cropper state
  const [cropperOpen, setCropperOpen] = useState(false)
  const [imageToCrop, setImageToCrop] = useState('')
  const [cropType, setCropType] = useState<'main' | 'gallery' | 'variant' | 'sizeChart'>('main')
  const [variantIdForCrop, setVariantIdForCrop] = useState<string>('')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    brandId: '',
    price: 0,
    offerPrice: 0,
    stock: 0,
    sku: '',
    sizes: [] as string[],
    tags: [] as string[],
    images: [] as string[],
    galleryImages: [] as string[], // Additional gallery images
    sizeChart: '', // Optional size chart image URL
    hasVariants: false,
    variants: [] as ProductVariant[],
    isActive: true,
    featured: false
  })

  useEffect(() => {
    fetchProducts()
    fetchCategories()
    fetchBrands()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/products?limit=1000')
      const data = await response.json()
      
      console.log('Products API response:', data)
      
      if (data.success) {
        setProducts(data.data)
        console.log('Products loaded:', data.data.length)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch products",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      if (data.success) {
        setCategories(data.data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchBrands = async () => {
    try {
      const response = await fetch('/api/brands')
      const data = await response.json()
      if (data.success) {
        setBrands(data.data)
      }
    } catch (error) {
      console.error('Error fetching brands:', error)
    }
  }

  const generateSKU = () => {
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.random().toString(36).substring(2, 5).toUpperCase()
    return `SKU-${timestamp}-${random}`
  }

  // Image upload handling with cropping
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files[0]) {
      const file = files[0]
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        if (result) {
          setImageToCrop(result)
          setCropType('main')
          setCropperOpen(true)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleGalleryImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files[0]) {
      const file = files[0]
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        if (result) {
          setImageToCrop(result)
          setCropType('gallery')
          setCropperOpen(true)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = (imageToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img !== imageToRemove)
    }))
  }

  const removeGalleryImage = (imageToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      galleryImages: prev.galleryImages.filter(img => img !== imageToRemove)
    }))
  }

  const handleSizeChartUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        if (result) {
          setImageToCrop(result)
          setCropType('sizeChart')
          setCropperOpen(true)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle cropped image completion
  const handleCropComplete = (croppedImageUrl: string) => {
    switch (cropType) {
      case 'main':
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, croppedImageUrl]
        }))
        break
      case 'gallery':
        setFormData(prev => ({
          ...prev,
          galleryImages: [...prev.galleryImages, croppedImageUrl]
        }))
        break
      case 'variant':
        if (variantIdForCrop) {
          updateVariant(variantIdForCrop, {
            images: [...(variants.find(v => v.id === variantIdForCrop)?.images || []), croppedImageUrl]
          })
        }
        break
      case 'sizeChart':
        setFormData(prev => ({
          ...prev,
          sizeChart: croppedImageUrl
        }))
        break
    }
    
    // Reset cropper state
    setCropperOpen(false)
    setImageToCrop('')
    setCropType('main')
    setVariantIdForCrop('')
  }

  // Size and stock management
  const addSizeStock = () => {
    if (newSize.trim() && newStock >= 0) {
      const sizeExists = sizeStocks.some(item => item.size === newSize.trim())
      if (!sizeExists) {
        setSizeStocks(prev => [...prev, { size: newSize.trim(), stock: newStock }])
        setFormData(prev => ({
          ...prev,
          sizes: [...prev.sizes, newSize.trim()]
        }))
        setNewSize('')
        setNewStock(0)
      } else {
        toast({
          title: "Error",
          description: "Size already exists",
          variant: "destructive"
        })
      }
    }
  }

  const removeSizeStock = (sizeToRemove: string) => {
    setSizeStocks(prev => prev.filter(item => item.size !== sizeToRemove))
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.filter(size => size !== sizeToRemove)
    }))
  }

  const updateSizeStock = (size: string, newStock: number) => {
    setSizeStocks(prev => prev.map(item => 
      item.size === size ? { ...item, stock: newStock } : item
    ))
  }

  // Variant management functions
  const addVariant = () => {
    if (newVariant.name.trim() && newVariant.value.trim()) {
      const variantId = `variant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const variantSku = `${formData.sku || generateSKU()}-${newVariant.name.toUpperCase().replace(/\s+/g, '')}`
      
      const variant: ProductVariant = {
        ...newVariant,
        id: variantId,
        sku: variantSku,
        name: newVariant.name.trim(),
        value: newVariant.value.trim()
      }
      
      setVariants(prev => [...prev, variant])
      setFormData(prev => ({
        ...prev,
        variants: [...prev.variants, variant],
        hasVariants: true
      }))
      
      // Reset new variant form
      setNewVariant({
        name: '',
        type: 'color',
        value: '',
        images: [],
        price: 0,
        offerPrice: 0,
        stock: 0,
        sizeStocks: [],
        sku: '',
        isActive: true
      })
    }
  }

  const removeVariant = (variantId: string) => {
    setVariants(prev => prev.filter(v => v.id !== variantId))
    setFormData(prev => {
      const updatedVariants = prev.variants.filter(v => v.id !== variantId)
      return {
        ...prev,
        variants: updatedVariants,
        hasVariants: updatedVariants.length > 0
      }
    })
  }

  const updateVariant = (variantId: string, updates: Partial<ProductVariant>) => {
    setVariants(prev => prev.map(v => 
      v.id === variantId ? { ...v, ...updates } : v
    ))
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map(v => 
        v.id === variantId ? { ...v, ...updates } : v
      )
    }))
  }

  const handleVariantImageUpload = (variantId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files[0]) {
      const file = files[0]
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        if (result) {
          setImageToCrop(result)
          setCropType('variant')
          setVariantIdForCrop(variantId)
          setCropperOpen(true)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const removeVariantImage = (variantId: string, imageToRemove: string) => {
    const variant = variants.find(v => v.id === variantId)
    if (variant) {
      updateVariant(variantId, {
        images: variant.images.filter(img => img !== imageToRemove)
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingProduct 
        ? `/api/products/${editingProduct._id}`
        : '/api/products'
      
      const method = editingProduct ? 'PUT' : 'POST'
      
      // Calculate total stock from size stocks
      const totalStock = sizeStocks.reduce((sum, item) => sum + item.stock, 0)
      
      const submitData = {
        ...formData,
        stock: totalStock,
        sizeStocks: sizeStocks, // Include size-specific stock data
        variants: variants, // Include variant data
        hasVariants: variants.length > 0 // Set hasVariants based on variants array
      }
      
      const response = await fetch(url, {
        method,
        credentials: 'include', // Include cookies for admin authentication
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData)
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: editingProduct 
            ? "Product updated successfully" 
            : "Product created successfully"
        })
        setIsDialogOpen(false)
        resetForm()
        fetchProducts()
      } else {
        // Check for authentication errors and redirect to login
        if (response.status === 401 || response.status === 403 || 
            data.error === 'Admin access revoked' || 
            data.error === 'Invalid token' || 
            data.error === 'No token provided') {
          toast({
            title: "Session Expired",
            description: "Please log in again",
            variant: "destructive"
          })
          window.location.href = '/admin/login'
          return
        }
        
        toast({
          title: "Error",
          description: data.error || "Failed to save product",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error saving product:', error)
      toast({
        title: "Error",
        description: "Failed to save product",
        variant: "destructive"
      })
    }
  }

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        credentials: 'include' // Include cookies for admin authentication
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Product deleted successfully"
        })
        fetchProducts()
      } else {
        // Check for authentication errors and redirect to login
        if (response.status === 401 || response.status === 403 || 
            data.error === 'Admin access revoked' || 
            data.error === 'Invalid token' || 
            data.error === 'No token provided') {
          toast({
            title: "Session Expired",
            description: "Please log in again",
            variant: "destructive"
          })
          window.location.href = '/admin/login'
          return
        }
        
        toast({
          title: "Error",
          description: data.error || "Failed to delete product",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive"
      })
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      categoryId: product.categoryId,
      brandId: product.brandId,
      price: product.price,
      offerPrice: product.offerPrice || 0,
      stock: product.stock,
      sku: product.sku,
      sizes: product.sizes || [],
      tags: product.tags || [],
      images: product.images || [],
      galleryImages: product.images, // Assuming gallery images are the same as main images for now
      sizeChart: (product as any).sizeChart || '', // Handle optional size chart
      hasVariants: product.hasVariants || false,
      variants: product.variants || [],
      isActive: product.isActive,
      featured: product.featured
    })
    
    // Initialize size stocks from existing sizeStocks or distribute evenly
    const productSizes = product.sizes || []
    const initialSizeStocks = product.sizeStocks && product.sizeStocks.length > 0
      ? product.sizeStocks
      : productSizes.map(size => ({
          size,
          stock: productSizes.length > 0 ? Math.floor(product.stock / productSizes.length) : 0 // Distribute stock evenly as fallback
        }))
    setSizeStocks(initialSizeStocks)
    
    // Initialize variants
    setVariants(product.variants || [])
    
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      categoryId: '',
      brandId: '',
      price: 0,
      offerPrice: 0,
      stock: 0,
      sku: '',
      sizes: [],
      tags: [],
      images: [],
      galleryImages: [],
      sizeChart: '',
      hasVariants: false,
      variants: [],
      isActive: true,
      featured: false
    })
    setSizeStocks([])
    setVariants([])
    setNewVariant({
      name: '',
      type: 'color',
      value: '',
      images: [],
      price: 0,
      offerPrice: 0,
      stock: 0,
      sizeStocks: [],
      sku: '',
      isActive: true
    })
    setNewSize('')
    setNewStock(0)
    setEditingProduct(null)
  }

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
      e.preventDefault()
      const newTag = e.currentTarget.value.trim()
      if (!formData.tags.includes(newTag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, newTag]
        }))
      }
      e.currentTarget.value = ''
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat._id === categoryId)
    return category ? category.name : 'Unknown'
  }

  const getBrandName = (brandId: string) => {
    const brand = brands.find(b => b._id === brandId)
    return brand ? brand.name : 'Unknown'
  }

  const filteredProducts = (products || []).filter(product => {
    const matchesSearch = (product.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (product.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (product.sku || '').toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || product.categoryId === selectedCategory
    const matchesBrand = selectedBrand === 'all' || product.brandId === selectedBrand
    return matchesSearch && matchesCategory && matchesBrand
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-sm sm:text-base text-gray-600">Manage your product catalog</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={fetchProducts} disabled={loading} className="w-full sm:w-auto">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
            Refresh
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()} className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-[800px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter product name"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="sku">SKU</Label>
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      placeholder="Auto-generated SKU"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter product description"
                    rows={3}
                  />
                </div>

                {/* Category and Brand */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.categoryId}
                      onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category._id} value={category._id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="brand">Brand *</Label>
                    <Select
                      value={formData.brandId}
                      onValueChange={(value) => setFormData({ ...formData, brandId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select brand" />
                      </SelectTrigger>
                      <SelectContent>
                        {brands.map((brand) => (
                          <SelectItem key={brand._id} value={brand._id}>
                            {brand.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Price *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="offerPrice">Offer Price (₹)</Label>
                    <Input
                      id="offerPrice"
                      type="number"
                      value={formData.offerPrice}
                      onChange={(e) => setFormData({ ...formData, offerPrice: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Dynamic Sizes and Stock */}
                <div>
                  <Label>Sizes & Stock</Label>
                  <div className="space-y-4">
                    {/* Add new size */}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Size (e.g., S, M, L, XL, 42, 43)"
                        value={newSize}
                        onChange={(e) => setNewSize(e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        placeholder="Stock"
                        value={newStock}
                        onChange={(e) => setNewStock(parseInt(e.target.value) || 0)}
                        className="w-24"
                      />
                      <Button type="button" onClick={addSizeStock} disabled={!newSize.trim()}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Display existing sizes */}
                    {sizeStocks.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-600">Current Sizes & Stock:</Label>
                        {sizeStocks.map((item, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 border rounded">
                            <Badge variant="outline">{item.size}</Badge>
                            <Input
                              type="number"
                              value={item.stock}
                              onChange={(e) => updateSizeStock(item.size, parseInt(e.target.value) || 0)}
                              className="w-20"
                              min="0"
                            />
                            <span className="text-sm text-gray-500">units</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSizeStock(item.size)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    placeholder="Press Enter to add tags"
                    onKeyDown={handleTagInput}
                  />
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                          {tag} ×
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Image Upload */}
                <div>
                  <Label>Product Images</Label>
                  <div className="space-y-4">
                    {/* Upload button */}
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Images
                      </Button>
                      <span className="text-sm text-gray-500">or drag and drop images here</span>
                    </div>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />

                    {/* Display uploaded images */}
                    {formData.images.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {formData.images.map((image, index) => (
                          image && (
                            <div key={index} className="relative">
                              <img
                                src={image}
                                alt={`Product ${index + 1}`}
                                className="w-full h-24 object-cover rounded"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute top-1 right-1"
                                onClick={() => removeImage(image)}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          )
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Gallery Images Upload */}
                <div>
                  <Label>Gallery Images (Additional)</Label>
                  <div className="space-y-4">
                    {/* Upload button */}
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const input = document.createElement('input')
                          input.type = 'file'
                          input.multiple = true
                          input.accept = 'image/*'
                          input.onchange = (e) => handleGalleryImageUpload(e as any)
                          input.click()
                        }}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Gallery Images
                      </Button>
                      <span className="text-sm text-gray-500">Additional images for product gallery</span>
                    </div>

                    {/* Display uploaded gallery images */}
                    {formData.galleryImages.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {formData.galleryImages.map((image, index) => (
                          image && (
                            <div key={index} className="relative">
                              <img
                                src={image}
                                alt={`Gallery ${index + 1}`}
                                className="w-full h-24 object-cover rounded"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute top-1 right-1"
                                onClick={() => removeGalleryImage(image)}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          )
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Size Chart Upload (Optional) */}
                <div>
                  <Label>Size Chart (Optional)</Label>
                  <div className="space-y-4">
                    {/* Upload button */}
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const input = document.createElement('input')
                          input.type = 'file'
                          input.accept = 'image/*'
                          input.onchange = (e) => handleSizeChartUpload(e as any)
                          input.click()
                        }}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Size Chart
                      </Button>
                      <span className="text-sm text-gray-500">Upload a size chart image to help customers choose the right size</span>
                    </div>

                    {/* Display uploaded size chart */}
                    {formData.sizeChart && (
                      <div className="relative inline-block">
                        <img
                          src={formData.sizeChart}
                          alt="Size Chart"
                          className="w-full max-w-md h-auto object-contain rounded border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => setFormData({ ...formData, sizeChart: '' })}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Product Variants */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Product Variants (Colors/Models)</Label>
                    <Switch
                      checked={formData.hasVariants}
                      onCheckedChange={(checked) => {
                        setFormData({ ...formData, hasVariants: checked })
                        if (!checked) {
                          setVariants([])
                          setFormData(prev => ({ ...prev, variants: [] }))
                        }
                      }}
                    />
                  </div>

                  {formData.hasVariants && (
                    <div className="space-y-4 border rounded-lg p-4">
                      {/* Add New Variant */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <Label>Variant Type</Label>
                          <Select
                            value={newVariant.type}
                            onValueChange={(value: 'color' | 'model') => 
                              setNewVariant({ ...newVariant, type: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="color">Color</SelectItem>
                              <SelectItem value="model">Model</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Name</Label>
                          <Input
                            placeholder="e.g., Red, Blue, Pro, Lite"
                            value={newVariant.name}
                            onChange={(e) => setNewVariant({ ...newVariant, name: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Variant Image</Label>
                          <div className="space-y-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const input = document.createElement('input')
                                input.type = 'file'
                                input.accept = 'image/*'
                                input.onchange = (e) => {
                                  const file = (e.target as HTMLInputElement).files?.[0]
                                  if (file) {
                                    const reader = new FileReader()
                                    reader.onload = (event) => {
                                      const result = event.target?.result as string
                                      if (result) {
                                        setNewVariant({ 
                                          ...newVariant, 
                                          value: result,
                                          images: [result]
                                        })
                                      }
                                    }
                                    reader.readAsDataURL(file)
                                  }
                                }
                                input.click()
                              }}
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Upload Image
                            </Button>
                            {newVariant.value && (
                              <div className="relative inline-block">
                                <img
                                  src={newVariant.value}
                                  alt="Variant preview"
                                  className="w-16 h-16 object-cover rounded border"
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  className="absolute -top-2 -right-2 w-5 h-5 p-0"
                                  onClick={() => setNewVariant({ ...newVariant, value: '', images: [] })}
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-end">
                          <Button type="button" onClick={addVariant} className="w-full">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Variant
                          </Button>
                        </div>
                      </div>

                      {/* Existing Variants */}
                      {variants.length > 0 && (
                        <div className="space-y-4">
                          <Label>Existing Variants</Label>
                          {variants.map((variant) => (
                            <div key={variant.id} className="border rounded-lg p-4 space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Badge variant={variant.type === 'color' ? 'default' : 'secondary'}>
                                    {variant.type}
                                  </Badge>
                                  <span className="font-medium">{variant.name}</span>
                                  {variant.value && (
                                    <div className="w-8 h-8 rounded border overflow-hidden">
                                      <img
                                        src={variant.value}
                                        alt={variant.name}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  )}
                                </div>
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => removeVariant(variant.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <Label>Price Override</Label>
                                  <Input
                                    type="number"
                                    placeholder="Optional"
                                    value={variant.price || ''}
                                    onChange={(e) => updateVariant(variant.id, { 
                                      price: e.target.value ? Number(e.target.value) : undefined 
                                    })}
                                  />
                                </div>
                                <div>
                                  <Label>Offer Price Override</Label>
                                  <Input
                                    type="number"
                                    placeholder="Optional"
                                    value={variant.offerPrice || ''}
                                    onChange={(e) => updateVariant(variant.id, { 
                                      offerPrice: e.target.value ? Number(e.target.value) : undefined 
                                    })}
                                  />
                                </div>
                                <div>
                                  <Label>Stock</Label>
                                  <Input
                                    type="number"
                                    value={variant.stock}
                                    onChange={(e) => updateVariant(variant.id, { 
                                      stock: Number(e.target.value) 
                                    })}
                                  />
                                </div>
                              </div>

                              {/* Variant Images */}
                              <div>
                                <Label>Variant Images</Label>
                                <div className="space-y-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const input = document.createElement('input')
                                      input.type = 'file'
                                      input.multiple = true
                                      input.accept = 'image/*'
                                      input.onchange = (e) => handleVariantImageUpload(variant.id, e as any)
                                      input.click()
                                    }}
                                  >
                                    <Upload className="w-4 h-4 mr-2" />
                                    Upload Images
                                  </Button>
                                  
                                  {variant.images.length > 0 && (
                                    <div className="grid grid-cols-4 gap-2">
                                      {variant.images.map((image, index) => (
                                        <div key={index} className="relative">
                                          <img
                                            src={image}
                                            alt={`${variant.name} ${index + 1}`}
                                            className="w-full h-16 object-cover rounded"
                                          />
                                          <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            className="absolute top-0 right-0 w-5 h-5 p-0"
                                            onClick={() => removeVariantImage(variant.id, image)}
                                          >
                                            <X className="w-3 h-3" />
                                          </Button>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Status */}
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                    />
                    <Label htmlFor="isActive">Active</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="featured"
                      checked={formData.featured}
                      onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                    />
                    <Label htmlFor="featured">Featured</Label>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingProduct ? 'Update Product' : 'Create Product'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-base sm:text-lg">
            <Filter className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Search & Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="relative sm:col-span-2 lg:col-span-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-sm sm:text-base"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="text-sm sm:text-base">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category._id} value={category._id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedBrand} onValueChange={setSelectedBrand}>
              <SelectTrigger className="text-sm sm:text-base">
                <SelectValue placeholder="All Brands" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Brands</SelectItem>
                {brands.map((brand) => (
                  <SelectItem key={brand._id} value={brand._id}>
                    {brand.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">All Products ({filteredProducts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-6 sm:py-8">
              <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin mr-2" />
              <span className="text-sm sm:text-base">Loading products...</span>
            </div>
          ) : (
            <>
              {/* Mobile Card Layout */}
              <div className="block lg:hidden space-y-4">
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">No products found</p>
                  </div>
                ) : (
                  filteredProducts.map((product) => (
                    <div key={product._id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        {(product.images || []).length > 0 ? (
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <ImageIcon className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm truncate">{product.name}</h3>
                          <p className="text-xs text-gray-500 line-clamp-2">{product.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {getCategoryName(product.categoryId)}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {getBrandName(product.brandId)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-gray-500">SKU:</span>
                          <code className="ml-1 bg-gray-100 px-1 py-0.5 rounded text-xs">{product.sku}</code>
                        </div>
                        <div>
                          <span className="text-gray-500">Stock:</span>
                          <Badge variant={product.stock > 0 ? "default" : "destructive"} className="ml-1 text-xs">
                            {product.stock}
                          </Badge>
                        </div>
                        <div>
                          <span className="text-gray-500">Price:</span>
                          <span className="ml-1 font-medium">₹{product.price}</span>
                          {product.offerPrice && product.offerPrice < product.price && (
                            <span className="ml-1 text-green-600">₹{product.offerPrice}</span>
                          )}
                        </div>
                        <div>
                          <span className="text-gray-500">Status:</span>
                          <Badge variant={product.isActive ? "default" : "secondary"} className="ml-1 text-xs">
                            {product.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2 border-t">
                        {product.featured && (
                          <Badge variant="outline" className="text-xs">
                            Featured
                          </Badge>
                        )}
                        <div className="flex items-center gap-2 ml-auto">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(product)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(product._id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {/* Desktop Table Layout */}
              <div className="hidden lg:block">
                <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      No products found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => (
                    <TableRow key={product._id}>
                      <TableCell>
                        {(product.images || []).length > 0 ? (
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                            <ImageIcon className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {product.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {product.sku}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getCategoryName(product.categoryId)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getBrandName(product.brandId)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">₹{product.price}</div>
                          {product.offerPrice && product.offerPrice < product.price && (
                            <div className="text-sm text-green-600">₹{product.offerPrice}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={product.stock > 0 ? "default" : "destructive"}>
                          {product.stock}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge variant={product.isActive ? "default" : "secondary"}>
                            {product.isActive ? "Active" : "Inactive"}
                          </Badge>
                          {product.featured && (
                            <Badge variant="outline" className="text-xs">
                              Featured
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(product)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(product._id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Image Cropper Modal */}
      <ImageCropper
        isOpen={cropperOpen}
        onClose={() => {
          setCropperOpen(false)
          setImageToCrop('')
          setCropType('main')
          setVariantIdForCrop('')
        }}
        imageSrc={imageToCrop}
        onCropComplete={handleCropComplete}
        aspectRatio={1} // Square aspect ratio
        title="Crop Product Image"
      />
    </div>
  )
}
