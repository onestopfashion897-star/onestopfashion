"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Eye, Star, MessageSquare, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { Review } from "@/lib/types"
import { Textarea } from "@/components/ui/textarea"

interface ReviewWithDetails extends Review {
  productName?: string
  reviewerName?: string
}

export default function ReviewsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [reviews, setReviews] = useState<ReviewWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // State for creating fake reviews
  const [products, setProducts] = useState<any[]>([])
  const [createLoading, setCreateLoading] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState<string>("")
  const [newRating, setNewRating] = useState<string>("5")
  const [newComment, setNewComment] = useState<string>("")
  const [newReviewerName, setNewReviewerName] = useState<string>("")
  const [newReviewerAvatar, setNewReviewerAvatar] = useState<string>("")

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/reviews', {
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        setReviews(data.data || [])
        setError(null)
      } else {
        throw new Error('Failed to fetch reviews')
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
      setError('Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [])

  // Fetch products for dropdown
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products?limit=100')
        if (res.ok) {
          const data = await res.json()
          setProducts(data.data || [])
        }
      } catch (err) {
        console.error('Error fetching products:', err)
      }
    }
    fetchProducts()
  }, [])

  const handleCreateFakeReview = async () => {
    if (!selectedProductId || !newComment.trim()) {
      toast({ title: 'Missing data', description: 'Select product and enter comment', variant: 'destructive' })
      return
    }
    const ratingNum = parseInt(newRating)
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      toast({ title: 'Invalid rating', description: 'Rating must be between 1 and 5', variant: 'destructive' })
      return
    }
    try {
      setCreateLoading(true)
      const res = await fetch('/api/admin/reviews', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProductId,
          rating: ratingNum,
          comment: newComment,
          reviewerName: newReviewerName,
          reviewerAvatar: newReviewerAvatar,
          status: 'approved'
        })
      })
      if (res.ok) {
        toast({ title: 'Review added', description: 'Fake review created successfully' })
        // Reset form
        setSelectedProductId('')
        setNewRating('5')
        setNewComment('')
        setNewReviewerName('')
        setNewReviewerAvatar('')
        // Refresh list
        fetchReviews()
      } else {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error || 'Failed to create review')
      }
    } catch (err: any) {
      console.error('Error creating review:', err)
      toast({ title: 'Error', description: err.message || 'Failed to create review', variant: 'destructive' })
    } finally {
      setCreateLoading(false)
    }
  }

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch = 
      (review.productName?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (review.reviewerName?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      review.comment.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || review.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const totalReviews = reviews.length
  const approvedReviews = reviews.filter((r) => r.status === "approved").length
  const pendingReviews = reviews.filter((r) => r.status === "pending").length
  const rejectedReviews = reviews.filter((r) => r.status === "rejected").length
  const avgRating = reviews.length > 0 ? Math.round(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length * 10) / 10 : 0

  const handleStatusChange = async (reviewId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/reviews', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reviewId,
          status: newStatus,
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Review ${newStatus} successfully`,
        })
        fetchReviews() // Refresh the list
      } else {
        throw new Error('Failed to update review status')
      }
    } catch (error) {
      console.error('Error updating review:', error)
      toast({
        title: "Error",
        description: "Failed to update review status",
        variant: "destructive",
      })
    }
  }

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) {
      return
    }

    try {
      const response = await fetch('/api/reviews', {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reviewId }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Review deleted successfully",
        })
        fetchReviews() // Refresh the list
      } else {
        throw new Error('Failed to delete review')
      }
    } catch (error) {
      console.error('Error deleting review:', error)
      toast({
        title: "Error",
        description: "Failed to delete review",
        variant: "destructive",
      })
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 sm:w-4 sm:h-4 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
      />
    ))
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Reviews</h1>
          <p className="text-sm sm:text-base text-gray-600">Manage product reviews and customer feedback</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
            <Filter className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
            <span className="text-xs sm:text-sm">Filter</span>
          </Button>
          <Button size="sm" className="flex-1 sm:flex-none">
            <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
            <span className="text-xs sm:text-sm">Export</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="pb-2 p-3 sm:p-4">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">Total Reviews</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold">{totalReviews}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 p-3 sm:p-4">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">Approved</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">{approvedReviews}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 p-3 sm:p-4">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">Pending</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-yellow-600">{pendingReviews}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 p-3 sm:p-4">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">Rejected</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-red-600">{rejectedReviews}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 p-3 sm:p-4">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">Avg Rating</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-600">{avgRating}/5</div>
          </CardContent>
        </Card>
      </div>

      {/* Add Fake Review */}
      <Card>
        <CardHeader className="pb-2 p-3 sm:p-4">
          <CardTitle className="text-sm sm:text-base font-medium text-gray-700">Add Fake Review</CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 pt-0 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-600">Product</label>
              <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                <SelectTrigger className="w-full text-sm">
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p._id} value={p._id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-gray-600">Rating</label>
              <Select value={newRating} onValueChange={setNewRating}>
                <SelectTrigger className="w-full text-sm">
                  <SelectValue placeholder="Select rating" />
                </SelectTrigger>
                <SelectContent>
                  {[1,2,3,4,5].map((r) => (
                    <SelectItem key={r} value={String(r)}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-600">Reviewer Name (optional)</label>
              <Input value={newReviewerName} onChange={(e) => setNewReviewerName(e.target.value)} className="text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-600">Reviewer Avatar URL (optional)</label>
              <Input value={newReviewerAvatar} onChange={(e) => setNewReviewerAvatar(e.target.value)} className="text-sm" />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-600">Comment</label>
            <Textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} className="text-sm" rows={3} />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleCreateFakeReview} disabled={createLoading}>
              {createLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Add Review'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-4 p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Input
                placeholder="Search reviews, products, or customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm sm:text-base"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px] text-sm sm:text-base">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reviews Table */}
      <Card>
        <CardContent className="pt-4 p-3 sm:p-4">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin mr-2" />
              <span className="text-sm sm:text-base">Loading reviews...</span>
            </div>
          ) : error ? (
            <div className="text-red-600 py-4 text-sm sm:text-base">{error}</div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-sm">Product</TableHead>
                      <TableHead className="text-sm">Reviewer</TableHead>
                      <TableHead className="text-sm">Rating</TableHead>
                      <TableHead className="text-sm">Comment</TableHead>
                      <TableHead className="text-sm">Status</TableHead>
                      <TableHead className="text-sm">Date</TableHead>
                      <TableHead className="text-right text-sm">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReviews.map((review) => (
                      <TableRow key={review._id?.toString()}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <div>
                              <div className="font-medium text-sm">{review.productName || 'Product'}</div>
                              <div className="text-xs text-gray-500">#{review.productId.toString()}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-sm">{review.reviewerName || 'Customer'}</div>
                            <div className="text-xs text-gray-500">#{review.userId.toString()}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {renderStars(review.rating)}
                            <span className="ml-2 text-xs text-gray-600">{review.rating}/5</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[300px] truncate text-sm">{review.comment}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              review.status === 'approved' ? 'default' : review.status === 'rejected' ? 'destructive' : 'secondary'
                            }
                            className="text-xs"
                          >
                            {review.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{new Date(review.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleStatusChange(review._id!.toString(), 'approved')}>
                                <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                <span>Approve</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(review._id!.toString(), 'rejected')}>
                                <XCircle className="mr-2 h-4 w-4 text-red-600" />
                                <span>Reject</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteReview(review._id!.toString())}>
                                <Trash2 className="mr-2 h-4 w-4 text-red-600" />
                                <span>Delete</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {filteredReviews.map((review) => (
                  <Card key={review._id?.toString()} className="p-3">
                    <div className="space-y-3">
                      {/* Product and Reviewer Info */}
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{review.productName || 'Product'}</div>
                          <div className="text-xs text-gray-500">#{review.productId.toString()}</div>
                          <div className="text-sm text-gray-700 mt-1">{review.reviewerName || 'Customer'}</div>
                          <div className="text-xs text-gray-500">#{review.userId.toString()}</div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleStatusChange(review._id!.toString(), 'approved')}>
                              <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                              <span>Approve</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(review._id!.toString(), 'rejected')}>
                              <XCircle className="mr-2 h-4 w-4 text-red-600" />
                              <span>Reject</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteReview(review._id!.toString())}>
                              <Trash2 className="mr-2 h-4 w-4 text-red-600" />
                              <span>Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center gap-1">
                        {renderStars(review.rating)}
                        <span className="ml-2 text-xs text-gray-600">{review.rating}/5</span>
                      </div>

                      {/* Comment */}
                      <div className="text-sm text-gray-700">
                        {review.comment}
                      </div>

                      {/* Status and Date */}
                      <div className="flex justify-between items-center">
                        <Badge
                          variant={
                            review.status === 'approved' ? 'default' : review.status === 'rejected' ? 'destructive' : 'secondary'
                          }
                          className="text-xs"
                        >
                          {review.status}
                        </Badge>
                        <span className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}