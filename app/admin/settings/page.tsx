"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Settings, 
  Store, 
  Shield, 
  CreditCard, 
  Truck, 
  Bell, 
  Globe, 
  Save,
  Eye,
  EyeOff,
  Palette,
  Database,
  Users,
  Key,
  User
} from "lucide-react"

export default function SettingsPage() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  // Admin profile state
  const [adminProfile, setAdminProfile] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })
  
  const [settings, setSettings] = useState({
    // General Settings
    storeName: "one stop fashion brand",
    storeEmail: "admin@onestopfashionbrand.com",
    storePhone: "+91 9876543210 ",
    storeAddress: "123 Fashion Street, Delhi, 110001",
    currency: "INR",
    timezone: "Asia/Kolkata",
    
    // Email Settings
    smtpHost: "smtp.gmail.com",
    smtpPort: "587",
    smtpUser: "noreply@onestopfashionbrand.com",
    smtpPassword: "********",
    
    // Payment Settings
    razorpayKey: "rzp_test_********",
    razorpaySecret: "********",
    enableCOD: true,
    enableUPI: true,
    
    // Shipping Settings
    freeShippingThreshold: 999,
    defaultShippingCost: 99,
    enableExpressShipping: true,
    expressShippingCost: 199,
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    orderConfirmations: true,
    shippingUpdates: true,
    
    // Security Settings
    twoFactorAuth: false,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    

  })

  const handleAdminProfileChange = (key: string, value: string) => {
    setAdminProfile(prev => ({ ...prev, [key]: value }))
  }



  const handlePasswordChange = async () => {
    if (!adminProfile.currentPassword || !adminProfile.newPassword || !adminProfile.confirmPassword) {
      alert('Please fill in all password fields')
      return
    }
    
    if (adminProfile.newPassword !== adminProfile.confirmPassword) {
      alert('New passwords do not match')
      return
    }
    
    try {
      const response = await fetch('/api/admin/profile/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          currentPassword: adminProfile.currentPassword,
          newPassword: adminProfile.newPassword 
        })
      })
      
      if (response.ok) {
        alert('Password updated successfully')
        setAdminProfile(prev => ({ 
          ...prev, 
          currentPassword: '', 
          newPassword: '', 
          confirmPassword: '' 
        }))
      } else {
        alert('Failed to update password')
      }
    } catch (error) {
      alert('Error updating password')
    }
  }

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Admin Profile Settings</h1>
          <p className="text-gray-600">Manage your admin account settings</p>
        </div>
      </div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                Admin Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Password Change Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Change Password</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative mt-1">
                      <Input
                        id="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        placeholder="Enter current password"
                        value={adminProfile.currentPassword}
                        onChange={(e) => handleAdminProfileChange("currentPassword", e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="newPassword">New Password</Label>
                      <div className="relative mt-1">
                        <Input
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          placeholder="Enter new password"
                          value={adminProfile.newPassword}
                          onChange={(e) => handleAdminProfileChange("newPassword", e.target.value)}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <div className="relative mt-1">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm new password"
                          value={adminProfile.confirmPassword}
                          onChange={(e) => handleAdminProfileChange("confirmPassword", e.target.value)}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                <Button onClick={handlePasswordChange} className="w-full md:w-auto">
                  <Key className="w-4 h-4 mr-2" />
                  Update Password
                </Button>
              </div>
            </CardContent>
          </Card>
    </div>
  )
}