"use client"

import { useState, useEffect } from 'react'
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
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar,
  Loader2,
  RefreshCw,
  Tag,
  Percent,
  DollarSign,
  Truck
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Coupon {
  _id: string
  code: string
  type: 'percentage' | 'fixed' | 'shipping'
  value: number
  maxDiscount?: number
  minAmount: number
  maxAmount?: number
  usageLimit: number
  usedCount: number
  validFrom: string
  validUntil: string
  description: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function CouponsPage() {
  const { toast } = useToast()
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed' | 'shipping',
    value: 0,
    maxDiscount: 0,
    minAmount: 0,
    maxAmount: 0,
    usageLimit: 100,
    validFrom: '',
    validUntil: '',
    description: '',
    isActive: true
  })

  useEffect(() => {
    fetchCoupons()
  }, [])

  const fetchCoupons = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/coupons')
      const data = await response.json()
      
      if (data.success) {
        setCoupons(data.data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch coupons",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fetching coupons:', error)
      toast({
        title: "Error",
        description: "Failed to fetch coupons",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingCoupon 
        ? `/api/coupons/${editingCoupon._id}`
        : '/api/coupons'
      
      const method = editingCoupon ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: editingCoupon 
            ? "Coupon updated successfully" 
            : "Coupon created successfully"
        })
        setIsDialogOpen(false)
        resetForm()
        fetchCoupons()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to save coupon",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error saving coupon:', error)
      toast({
        title: "Error",
        description: "Failed to save coupon",
        variant: "destructive"
      })
    }
  }

  const handleDelete = async (couponId: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return

    try {
      const response = await fetch(`/api/coupons/${couponId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Coupon deleted successfully"
        })
        fetchCoupons()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to delete coupon",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error deleting coupon:', error)
      toast({
        title: "Error",
        description: "Failed to delete coupon",
        variant: "destructive"
      })
    }
  }

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon)
    setFormData({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      maxDiscount: coupon.maxDiscount || 0,
      minAmount: coupon.minAmount,
      maxAmount: coupon.maxAmount || 0,
      usageLimit: coupon.usageLimit,
      validFrom: new Date(coupon.validFrom).toISOString().split('T')[0],
      validUntil: new Date(coupon.validUntil).toISOString().split('T')[0],
      description: coupon.description,
      isActive: coupon.isActive
    })
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      code: '',
      type: 'percentage',
      value: 0,
      maxDiscount: 0,
      minAmount: 0,
      maxAmount: 0,
      usageLimit: 100,
      validFrom: '',
      validUntil: '',
      description: '',
      isActive: true
    })
    setEditingCoupon(null)
  }

  const generateCouponCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setFormData(prev => ({ ...prev, code: result }))
  }

  const getCouponTypeIcon = (type: string) => {
    switch (type) {
      case 'percentage':
        return <Percent className="w-4 h-4" />
      case 'fixed':
        return <DollarSign className="w-4 h-4" />
      case 'shipping':
        return <Truck className="w-4 h-4" />
      default:
        return <Tag className="w-4 h-4" />
    }
  }

  const getCouponTypeLabel = (type: string) => {
    switch (type) {
      case 'percentage':
        return 'Percentage'
      case 'fixed':
        return 'Fixed Amount'
      case 'shipping':
        return 'Free Shipping'
      default:
        return type
    }
  }

  const isCouponExpired = (validUntil: string) => {
    return new Date(validUntil) < new Date()
  }

  const isCouponActive = (coupon: Coupon) => {
    const now = new Date()
    const validFrom = new Date(coupon.validFrom)
    const validUntil = new Date(coupon.validUntil)
    return coupon.isActive && now >= validFrom && now <= validUntil && coupon.usedCount < coupon.usageLimit
  }

  const filteredCoupons = coupons.filter(coupon => {
    const matchesSearch = coupon.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         coupon.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    let matchesStatus = true
    if (statusFilter && statusFilter !== 'all') {
      if (statusFilter === 'active') {
        matchesStatus = isCouponActive(coupon)
      } else if (statusFilter === 'inactive') {
        matchesStatus = !isCouponActive(coupon) && !isCouponExpired(coupon.validUntil)
      } else if (statusFilter === 'expired') {
        matchesStatus = isCouponExpired(coupon.validUntil)
      }
    }
    
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: coupons.length,
    active: coupons.filter(c => isCouponActive(c)).length,
    expired: coupons.filter(c => isCouponExpired(c.validUntil)).length,
    percentage: coupons.filter(c => c.type === 'percentage').length,
    fixed: coupons.filter(c => c.type === 'fixed').length,
    shipping: coupons.filter(c => c.type === 'shipping').length
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Coupons</h1>
          <p className="text-sm sm:text-base text-gray-600">Manage discount coupons and promotional codes</p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <Button variant="outline" onClick={fetchCoupons}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="w-4 h-4 mr-2" />
                Add Coupon
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl">
                  {editingCoupon ? 'Edit Coupon' : 'Add New Coupon'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <Label htmlFor="code" className="text-sm">Coupon Code *</Label>
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                      <Input
                        id="code"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        placeholder="Enter coupon code"
                        className="text-sm"
                        required
                      />
                      <Button type="button" variant="outline" onClick={generateCouponCode} className="text-sm px-3 py-2">
                        Generate
                      </Button>
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="type" className="text-sm">Coupon Type *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: 'percentage' | 'fixed' | 'shipping') => 
                        setFormData({ ...formData, type: value })
                      }
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage Discount</SelectItem>
                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                        <SelectItem value="shipping">Free Shipping</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="value" className="text-sm">
                      {formData.type === 'percentage' ? 'Discount Percentage' : 
                       formData.type === 'fixed' ? 'Discount Amount' : 'Shipping Discount'} *
                    </Label>
                    <Input
                      id="value"
                      type="number"
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                      placeholder={formData.type === 'percentage' ? '10' : '100'}
                      className="text-sm"
                      required
                    />
                  </div>
                  {formData.type === 'percentage' && (
                    <div>
                      <Label htmlFor="maxDiscount" className="text-sm">Maximum Discount</Label>
                      <Input
                        id="maxDiscount"
                        type="number"
                        value={formData.maxDiscount}
                        onChange={(e) => setFormData({ ...formData, maxDiscount: parseFloat(e.target.value) || 0 })}
                        placeholder="500"
                        className="text-sm"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="minAmount" className="text-sm">Minimum Order Amount *</Label>
                    <Input
                      id="minAmount"
                      type="number"
                      value={formData.minAmount}
                      onChange={(e) => setFormData({ ...formData, minAmount: parseFloat(e.target.value) || 0 })}
                      placeholder="1000"
                      className="text-sm"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxAmount" className="text-sm">Maximum Order Amount</Label>
                    <Input
                      id="maxAmount"
                      type="number"
                      value={formData.maxAmount}
                      onChange={(e) => setFormData({ ...formData, maxAmount: parseFloat(e.target.value) || 0 })}
                      placeholder="10000"
                      className="text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="usageLimit" className="text-sm">Usage Limit *</Label>
                    <Input
                      id="usageLimit"
                      type="number"
                      value={formData.usageLimit}
                      onChange={(e) => setFormData({ ...formData, usageLimit: parseInt(e.target.value) || 0 })}
                      placeholder="100"
                      className="text-sm"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="validFrom" className="text-sm">Valid From *</Label>
                    <Input
                      id="validFrom"
                      type="date"
                      value={formData.validFrom}
                      onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                      className="text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="validUntil" className="text-sm">Valid Until *</Label>
                  <Input
                    id="validUntil"
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    className="text-sm"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-sm">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter coupon description"
                    className="text-sm"
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="isActive" className="text-sm">Active</Label>
                </div>

                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="text-sm px-4 py-2"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="text-sm px-4 py-2">
                    {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="text-lg sm:text-2xl font-bold">{stats.total}</div>
            <div className="text-xs sm:text-sm text-gray-600">Total Coupons</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="text-lg sm:text-2xl font-bold text-green-600">{stats.active}</div>
            <div className="text-xs sm:text-sm text-gray-600">Active</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="text-lg sm:text-2xl font-bold text-red-600">{stats.expired}</div>
            <div className="text-xs sm:text-sm text-gray-600">Expired</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="text-lg sm:text-2xl font-bold text-blue-600">{stats.percentage}</div>
            <div className="text-xs sm:text-sm text-gray-600">Percentage</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="text-lg sm:text-2xl font-bold text-purple-600">{stats.fixed}</div>
            <div className="text-xs sm:text-sm text-gray-600">Fixed Amount</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="text-lg sm:text-2xl font-bold text-orange-600">{stats.shipping}</div>
            <div className="text-xs sm:text-sm text-gray-600">Free Shipping</div>
          </CardContent>
        </Card>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 sm:w-4 sm:h-4" />
              <Input
                placeholder="Search coupons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 sm:pl-10 text-sm sm:text-base"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="text-sm sm:text-base">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Coupons Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">All Coupons ({filteredCoupons.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin mr-2" />
              <span className="text-sm sm:text-base">Loading coupons...</span>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden sm:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-sm">Code</TableHead>
                      <TableHead className="text-sm">Type</TableHead>
                      <TableHead className="text-sm">Value</TableHead>
                      <TableHead className="text-sm">Usage</TableHead>
                      <TableHead className="text-sm">Validity</TableHead>
                      <TableHead className="text-sm">Status</TableHead>
                      <TableHead className="text-right text-sm">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCoupons.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          No coupons found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCoupons.map((coupon) => (
                        <TableRow key={coupon._id}>
                          <TableCell>
                            <div>
                              <div className="font-mono font-medium text-sm">{coupon.code}</div>
                              <div className="text-xs text-gray-500">{coupon.description}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getCouponTypeIcon(coupon.type)}
                              <span className="text-xs">{getCouponTypeLabel(coupon.type)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="text-sm">{coupon.type === 'percentage' ? `${coupon.value}%` : `₹${coupon.value}`}</div>
                              {coupon.maxDiscount && coupon.type === 'percentage' && (
                                <div className="text-xs text-gray-500">Max: ₹{coupon.maxDiscount}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-xs">
                              {coupon.usedCount} / {coupon.usageLimit}
                            </div>
                            <div className="text-xs text-gray-500">
                              Min: ₹{coupon.minAmount}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-xs">
                              <div>From: {new Date(coupon.validFrom).toLocaleDateString()}</div>
                              <div>Until: {new Date(coupon.validUntil).toLocaleDateString()}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <Badge variant={isCouponActive(coupon) ? "default" : "secondary"} className="text-xs">
                                {isCouponActive(coupon) ? "Active" : "Inactive"}
                              </Badge>
                              {isCouponExpired(coupon.validUntil) && (
                                <Badge variant="destructive" className="text-xs">
                                  Expired
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(coupon)}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(coupon._id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="sm:hidden space-y-3">
                {filteredCoupons.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No coupons found
                  </div>
                ) : (
                  filteredCoupons.map((coupon) => (
                    <Card key={coupon._id} className="p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-mono font-medium text-sm">{coupon.code}</div>
                            <div className="text-xs text-gray-500 mt-1">{coupon.description}</div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(coupon)}
                              className="p-1"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(coupon._id)}
                              className="text-red-600 hover:text-red-700 p-1"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <div className="text-gray-500">Type</div>
                            <div className="flex items-center space-x-1 mt-1">
                              {getCouponTypeIcon(coupon.type)}
                              <span>{getCouponTypeLabel(coupon.type)}</span>
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-500">Value</div>
                            <div className="mt-1">
                              <div>{coupon.type === 'percentage' ? `${coupon.value}%` : `₹${coupon.value}`}</div>
                              {coupon.maxDiscount && coupon.type === 'percentage' && (
                                <div className="text-xs text-gray-500">Max: ₹{coupon.maxDiscount}</div>
                              )}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-500">Usage</div>
                            <div className="mt-1">
                              <div>{coupon.usedCount} / {coupon.usageLimit}</div>
                              <div className="text-xs text-gray-500">Min: ₹{coupon.minAmount}</div>
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-500">Validity</div>
                            <div className="mt-1">
                              <div>From: {new Date(coupon.validFrom).toLocaleDateString()}</div>
                              <div>Until: {new Date(coupon.validUntil).toLocaleDateString()}</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center pt-2 border-t">
                          <div className="space-y-1">
                            <Badge variant={isCouponActive(coupon) ? "default" : "secondary"} className="text-xs">
                              {isCouponActive(coupon) ? "Active" : "Inactive"}
                            </Badge>
                            {isCouponExpired(coupon.validUntil) && (
                              <Badge variant="destructive" className="text-xs ml-1">
                                Expired
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}