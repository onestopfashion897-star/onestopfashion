"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Edit, 
  Save, 
  X, 
  Package, 
  Heart, 
  Settings,
  LogOut,
  Shield,
  CreditCard,
  Lock,
  Eye,
  EyeOff,
  Star
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'

interface UserProfile {
  name: string
  email: string
  phone: string
  addresses: Array<{
    _id: string
    fullName: string
    phone: string
    address: string
    city: string
    state: string
    pincode: string
    isDefault: boolean
  }>
}

export default function AccountPage() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const { toast } = useToast()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  })
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [changingPassword, setChangingPassword] = useState(false)
  const [stats, setStats] = useState({
    totalOrders: 0,
    wishlistItems: 0,
    memberSince: new Date().toLocaleDateString()
  })

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    fetchProfile()
  }, [user, router])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      })
      const data = await response.json()

      if (data.success) {
        setProfile(data.data)
        setFormData({
          name: data.data.name || '',
          email: data.data.email || '',
          phone: data.data.phone || '',
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
    
    // Fetch user stats
    fetchUserStats()
  }

  const fetchUserStats = async () => {
    try {
      const [ordersResponse, wishlistResponse] = await Promise.all([
        fetch('/api/orders/my-orders', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
        }),
        fetch('/api/wishlist', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
        })
      ])

      const ordersData = await ordersResponse.json()
      const wishlistData = await wishlistResponse.json()

      setStats({
        totalOrders: ordersData.success ? ordersData.data.length : 0,
        wishlistItems: wishlistData.success ? wishlistData.data.length : 0,
        memberSince: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : new Date().toLocaleDateString()
      })
    } catch (error) {
      console.error('Error fetching user stats:', error)
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive",
      })
    }
  }

  const handleUpdateProfile = async () => {
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        setProfile(data.data)
        setEditing(false)
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully",
        })
      } else {
        toast({
          title: "Update failed",
          description: data.error || "Failed to update profile",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      })
    }
  }

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "New passwords do not match",
        variant: "destructive",
      })
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      })
      return
    }

    setChangingPassword(true)
    try {
      const response = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(passwordData),
      })

      const data = await response.json()

      if (data.success) {
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        })
        setShowChangePassword(false)
        toast({
          title: "Password changed",
          description: "Your password has been changed successfully",
        })
      } else {
        toast({
          title: "Password change failed",
          description: data.error || "Failed to change password",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to change password",
        variant: "destructive",
      })
    } finally {
      setChangingPassword(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/')
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-16 pt-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading profile...</h2>
            <p className="text-gray-600">Please wait while we fetch your profile.</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 pt-20">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Account</h1>
          <p className="text-gray-600 text-lg">Manage your profile and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Card */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-3xl">
              <CardHeader className="pb-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
                    <User className="w-6 h-6 mr-3 text-blue-600" />
                    Profile Information
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditing(!editing)}
                    className="rounded-xl border-2 hover:bg-blue-50 hover:border-blue-500"
                  >
                    {editing ? <X className="w-4 h-4 mr-2" /> : <Edit className="w-4 h-4 mr-2" />}
                    {editing ? 'Cancel' : 'Edit'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {editing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="rounded-xl border-2 focus:border-blue-500"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="rounded-xl border-2 focus:border-blue-500"
                        placeholder="Enter your email"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                      <Input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="rounded-xl border-2 focus:border-blue-500"
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button
                        onClick={handleUpdateProfile}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setEditing(false)}
                        className="border-2 border-gray-200 hover:border-gray-300 rounded-xl px-6 py-2 font-semibold"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-2xl">
                      <User className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="text-sm text-gray-600">Full Name</p>
                        <p className="font-semibold text-gray-900">{profile.name || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-2xl">
                      <Mail className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-semibold text-gray-900">{profile.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-2xl">
                      <Phone className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-semibold text-gray-900">{profile.phone || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Addresses */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-3xl">
              <CardHeader className="pb-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
                    <MapPin className="w-6 h-6 mr-3 text-blue-600" />
                    Delivery Addresses
                  </CardTitle>
                  <Link href="/account/addresses">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl border-2 hover:bg-blue-50 hover:border-blue-500"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Manage
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {profile.addresses && profile.addresses.length > 0 ? (
                  <div className="space-y-4">
                    {profile.addresses.slice(0, 2).map((address) => (
                      <div key={address._id} className="p-4 bg-gray-50 rounded-2xl">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-gray-900">{address.fullName}</p>
                            <p className="text-gray-600">{address.address}</p>
                            <p className="text-gray-600">
                              {address.city}, {address.state} {address.pincode}
                            </p>
                            <p className="text-gray-600">{address.phone}</p>
                          </div>
                          {address.isDefault && (
                            <Badge className="bg-blue-100 text-blue-800">Default</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                    {profile.addresses.length > 2 && (
                      <p className="text-sm text-gray-600 text-center">
                        +{profile.addresses.length - 2} more addresses
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No addresses added yet</p>
                    <Link href="/account/addresses">
                      <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                        Add Address
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-3xl">
              <CardHeader className="pb-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
                    <Shield className="w-6 h-6 mr-3 text-blue-600" />
                    Security Settings
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowChangePassword(!showChangePassword)}
                    className="rounded-xl border-2 hover:bg-blue-50 hover:border-blue-500"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Change Password
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {showChangePassword ? (
                  <div className="space-y-4">
                    <div className="relative">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
                      <div className="relative">
                        <Input
                          type={showPasswords.current ? "text" : "password"}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          className="rounded-xl border-2 focus:border-blue-500 pr-10"
                          placeholder="Enter your current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="relative">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                      <div className="relative">
                        <Input
                          type={showPasswords.new ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          className="rounded-xl border-2 focus:border-blue-500 pr-10"
                          placeholder="Enter your new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="relative">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
                      <div className="relative">
                        <Input
                          type={showPasswords.confirm ? "text" : "password"}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          className="rounded-xl border-2 focus:border-blue-500 pr-10"
                          placeholder="Confirm your new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        onClick={handleChangePassword}
                        disabled={changingPassword || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                      >
                        {changingPassword ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Changing...
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4 mr-2" />
                            Change Password
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowChangePassword(false)
                          setPasswordData({
                            currentPassword: '',
                            newPassword: '',
                            confirmPassword: '',
                          })
                        }}
                        className="border-2 border-gray-200 hover:border-gray-300 rounded-xl px-6 py-2 font-semibold"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Keep your account secure</p>
                    <p className="text-sm text-gray-500 mb-4">
                      Last password change: Never
                    </p>
                    <Button
                      onClick={() => setShowChangePassword(true)}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      Change Password
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-3xl sticky top-24">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl font-bold text-gray-900">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link href="/account/orders">
                  <Button
                    variant="outline"
                    className="w-full justify-start border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 rounded-2xl py-4 font-semibold transition-all duration-300"
                  >
                    <Package className="w-5 h-5 mr-3" />
                    My Orders
                  </Button>
                </Link>

                <Link href="/account/wishlist">
                  <Button
                    variant="outline"
                    className="w-full justify-start border-2 border-gray-200 hover:border-red-300 hover:bg-red-50 rounded-2xl py-4 font-semibold transition-all duration-300"
                  >
                    <Heart className="w-5 h-5 mr-3" />
                    Wishlist
                  </Button>
                </Link>

                <Link href="/account/reviews">
                  <Button
                    variant="outline"
                    className="w-full justify-start border-2 border-gray-200 hover:border-yellow-300 hover:bg-yellow-50 rounded-2xl py-4 font-semibold transition-all duration-300"
                  >
                    <Star className="w-5 h-5 mr-3" />
                    My Reviews
                  </Button>
                </Link>

                <Link href="/account/addresses">
                  <Button
                    variant="outline"
                    className="w-full justify-start border-2 border-gray-200 hover:border-green-300 hover:bg-green-50 rounded-2xl py-4 font-semibold transition-all duration-300"
                  >
                    <MapPin className="w-5 h-5 mr-3" />
                    Addresses
                  </Button>
                </Link>

                <Link href="/account/settings">
                  <Button
                    variant="outline"
                    className="w-full justify-start border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50 rounded-2xl py-4 font-semibold transition-all duration-300"
                  >
                    <Settings className="w-5 h-5 mr-3" />
                    Settings
                  </Button>
                </Link>

                <Separator />

                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="w-full justify-start border-2 border-red-200 hover:border-red-300 hover:bg-red-50 hover:text-red-600 rounded-2xl py-4 font-semibold transition-all duration-300"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  Logout
                </Button>
              </CardContent>
            </Card>

            {/* Account Stats */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-3xl mt-6">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl font-bold text-gray-900">Account Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-2xl">
                  <div className="flex items-center space-x-3">
                    <Package className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-gray-900">Total Orders</span>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">{stats.totalOrders}</Badge>
                </div>
                <div className="flex items-center justify-between p-4 bg-red-50 rounded-2xl">
                  <div className="flex items-center space-x-3">
                    <Heart className="w-5 h-5 text-red-600" />
                    <span className="font-semibold text-gray-900">Wishlist Items</span>
                  </div>
                  <Badge className="bg-red-100 text-red-800">{stats.wishlistItems}</Badge>
                </div>
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-2xl">
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-gray-900">Member Since</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    {stats.memberSince}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
