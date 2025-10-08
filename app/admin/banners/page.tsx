"use client"

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  Plus, 
  Edit, 
  Trash2, 
  GripVertical, 
  Loader2, 
  ExternalLink,
  Image as ImageIcon,
  Upload,
  X,
  Crop
} from 'lucide-react'
import { toast } from 'sonner'
import { BannerImageCropper } from '@/components/ui/banner-image-cropper'

interface HorizontalBanner {
  _id: string
  imageUrl: string
  linkUrl?: string
  index: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function BannersPage() {
  const [banners, setBanners] = useState<HorizontalBanner[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBanner, setEditingBanner] = useState<HorizontalBanner | null>(null)
  const [formData, setFormData] = useState({
    imageUrl: '',
    linkUrl: '',
    index: 1,
    isActive: true
  })
  const [submitting, setSubmitting] = useState(false)
  const [uploadMethod, setUploadMethod] = useState<'url' | 'file'>('url')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [cropperOpen, setCropperOpen] = useState(false)
  const [imageToCrop, setImageToCrop] = useState('')

  useEffect(() => {
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    try {
      const response = await fetch('/api/horizontal-banners', {
        credentials: 'include' // Use cookies for authentication
      })
      const data = await response.json()
      
      if (data.success) {
        setBanners(data.data)
      } else {
        toast.error('Failed to fetch banners')
      }
    } catch (error) {
      console.error('Error fetching banners:', error)
      toast.error('Failed to fetch banners')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate that an image is provided
    if (!formData.imageUrl.trim()) {
      toast.error('Please provide an image URL or upload an image file')
      return
    }
    
    setSubmitting(true)

    try {
      const url = editingBanner 
        ? `/api/horizontal-banners/${editingBanner._id}`
        : '/api/horizontal-banners'
      
      const method = editingBanner ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Use cookies for authentication
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        toast.success(editingBanner ? 'Banner updated successfully' : 'Banner created successfully')
        setIsDialogOpen(false)
        resetForm()
        fetchBanners()
      } else {
        toast.error(data.error || 'Failed to save banner')
      }
    } catch (error) {
      console.error('Error saving banner:', error)
      toast.error('Failed to save banner')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (banner: HorizontalBanner) => {
    setEditingBanner(banner)
    setFormData({
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl || '',
      index: banner.index,
      isActive: banner.isActive
    })
    // Determine upload method based on existing image URL
    setUploadMethod(banner.imageUrl.startsWith('data:') ? 'file' : 'url')
    setIsDialogOpen(true)
  }

  const handleDelete = async (bannerId: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) {
      return
    }

    try {
      const response = await fetch(`/api/horizontal-banners/${bannerId}`, {
        method: 'DELETE',
        credentials: 'include' // Use cookies for authentication
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Banner deleted successfully')
        fetchBanners()
      } else {
        toast.error(data.error || 'Failed to delete banner')
      }
    } catch (error) {
      console.error('Error deleting banner:', error)
      toast.error('Failed to delete banner')
    }
  }

  const handleToggleActive = async (bannerId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/horizontal-banners/${bannerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Use cookies for authentication
        body: JSON.stringify({ isActive })
      })

      const data = await response.json()

      if (data.success) {
        toast.success(`Banner ${isActive ? 'activated' : 'deactivated'} successfully`)
        fetchBanners()
      } else {
        toast.error(data.error || 'Failed to update banner')
      }
    } catch (error) {
      console.error('Error updating banner:', error)
      toast.error('Failed to update banner')
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB')
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        if (result) {
          setImageToCrop(result)
          setCropperOpen(true)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCropComplete = (croppedImage: string) => {
    setFormData(prev => ({
      ...prev,
      imageUrl: croppedImage
    }))
    toast.success('Image cropped successfully')
  }

  const removeUploadedImage = () => {
    setFormData(prev => ({
      ...prev,
      imageUrl: ''
    }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const resetForm = () => {
    setFormData({
      imageUrl: '',
      linkUrl: '',
      index: banners.length + 1,
      isActive: true
    })
    setEditingBanner(null)
    setUploadMethod('url')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const openCreateDialog = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Loading banners...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Horizontal Banners</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">Manage scrollable banner images for the homepage</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Add Banner
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingBanner ? 'Edit Banner' : 'Add New Banner'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Image *</Label>
                <div className="space-y-3">
                  {/* Upload method selection */}
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={uploadMethod === 'url' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setUploadMethod('url')}
                    >
                      URL
                    </Button>
                    <Button
                      type="button"
                      variant={uploadMethod === 'file' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setUploadMethod('file')}
                    >
                      Upload File
                    </Button>
                  </div>

                  {uploadMethod === 'url' ? (
                     <Input
                       id="imageUrl"
                       type="url"
                       value={formData.imageUrl}
                       onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                       placeholder="https://example.com/banner.jpg"
                     />
                   ) : (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Choose Image
                        </Button>
                        <span className="text-sm text-gray-500">JPG, PNG, WebP (Max 5MB)</span>
                      </div>
                      
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />

                      {/* Preview uploaded image */}
                      {formData.imageUrl && uploadMethod === 'file' && (
                        <div className="space-y-2">
                          <div className="relative inline-block">
                            <div className="w-32 h-40 rounded-2xl overflow-hidden border-2 border-gray-300 bg-gray-100">
                              <img
                                src={formData.imageUrl}
                                alt="Banner preview"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full"
                              onClick={removeUploadedImage}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                          <p className="text-xs text-gray-500">Preview: Hero banner format (4:5 portrait)</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <Label htmlFor="linkUrl">Link URL (Optional)</Label>
                <Input
                  id="linkUrl"
                  type="url"
                  value={formData.linkUrl}
                  onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                  placeholder="https://example.com/collection"
                />
                <p className="text-xs text-gray-500 mt-1">Users will be redirected here when clicking the banner</p>
              </div>

              <div>
                <Label htmlFor="index">Display Order</Label>
                <Input
                  id="index"
                  type="number"
                  min="1"
                  value={formData.index}
                  onChange={(e) => setFormData({ ...formData, index: parseInt(e.target.value) || 1 })}
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={submitting} className="flex-1">
                  {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editingBanner ? 'Update' : 'Create'} Banner
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Image Cropper */}
      <BannerImageCropper
        open={cropperOpen}
        onClose={() => setCropperOpen(false)}
        imageSrc={imageToCrop}
        onCropComplete={handleCropComplete}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">All Banners ({banners.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {banners.length === 0 ? (
            <div className="text-center py-8">
              <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm sm:text-base text-gray-500">No banners found. Create your first banner to get started.</p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="block sm:hidden space-y-4">
                {banners
                  .sort((a, b) => a.index - b.index)
                  .map((banner) => (
                    <Card key={banner._id} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-16 h-10 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                              <img
                                src={banner.imageUrl}
                                alt={`Banner ${banner.index}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <Badge variant="outline" className="text-xs">#{banner.index}</Badge>
                              <div className="flex items-center gap-2 mt-1">
                                <Switch
                                  checked={banner.isActive}
                                  onCheckedChange={(checked) => handleToggleActive(banner._id, checked)}
                                  className="scale-75"
                                />
                                <Badge variant={banner.isActive ? "default" : "secondary"} className="text-xs">
                                  {banner.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(banner)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(banner._id)}
                              className="text-red-600 hover:text-red-800 h-8 w-8 p-0"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        
                        {banner.linkUrl && (
                          <div className="text-xs">
                            <span className="text-gray-500">Link: </span>
                            <a 
                              href={banner.linkUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 break-all"
                              title={banner.linkUrl}
                            >
                              <ExternalLink className="w-3 h-3 inline mr-1" />
                              {banner.linkUrl}
                            </a>
                          </div>
                        )}
                        
                        <div className="text-xs text-gray-500">
                          Created: {new Date(banner.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </Card>
                  ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Preview</TableHead>
                      <TableHead>Order</TableHead>
                      <TableHead>Link</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {banners
                      .sort((a, b) => a.index - b.index)
                      .map((banner) => (
                        <TableRow key={banner._id}>
                          <TableCell>
                            <div className="w-20 h-12 rounded overflow-hidden bg-gray-100">
                              <img
                                src={banner.imageUrl}
                                alt={`Banner ${banner.index}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">#{banner.index}</Badge>
                          </TableCell>
                          <TableCell>
                            {banner.linkUrl ? (
                              <a 
                                href={banner.linkUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-blue-600 hover:text-blue-800 max-w-xs truncate"
                                title={banner.linkUrl}
                              >
                                <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{banner.linkUrl}</span>
                              </a>
                            ) : (
                              <span className="text-gray-400">No link</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={banner.isActive}
                                onCheckedChange={(checked) => handleToggleActive(banner._id, checked)}
                              />
                              <Badge variant={banner.isActive ? "default" : "secondary"}>
                                {banner.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(banner.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(banner)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(banner._id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}