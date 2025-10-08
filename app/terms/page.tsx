"use client"

import { Navbar } from '@/components/ui/navbar'
import { TopHeader } from '@/components/ui/top-header'
import { Footer } from '@/components/ui/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { AlertTriangle, Shield, CreditCard, Truck, Phone } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <TopHeader />
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms & Conditions</h1>
          <p className="text-xl text-gray-600">
            Please read these terms and conditions carefully before using our services.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="space-y-8">
          {/* Important Notice */}
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-red-800">
                <AlertTriangle className="w-5 h-5" />
                <span>Important Notice</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-red-700">
              <p className="font-semibold text-lg mb-2">NO RETURN | NO EXCHANGE POLICY</p>
              <p>
                All sales are final. We do not accept returns or exchanges for any products purchased from Happy Feet. 
                Please ensure you review your order carefully before completing your purchase.
              </p>
            </CardContent>
          </Card>

          {/* General Terms */}
          <Card>
            <CardHeader>
              <CardTitle>1. General Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                By accessing and using the Happy Feet website and services, you accept and agree to be bound by the terms and provision of this agreement.
              </p>
              <p>
                Happy Feet reserves the right to modify these terms at any time without prior notice. Your continued use of the website constitutes acceptance of any changes.
              </p>
            </CardContent>
          </Card>

          {/* Products and Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-purple-600" />
                <span>2. Products and Pricing</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                All product descriptions, images, and prices are subject to change without notice. We strive to display accurate information, but cannot guarantee that all details are error-free.
              </p>
              <p>
                Prices are listed in Indian Rupees (INR) and include applicable taxes unless otherwise stated.
              </p>
              <p>
                We reserve the right to refuse or cancel any order at our discretion, including but not limited to cases of suspected fraud or unavailability of products.
              </p>
            </CardContent>
          </Card>

          {/* Payment Terms */}
          <Card>
            <CardHeader>
              <CardTitle>3. Payment Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Payment must be made in full at the time of purchase. We accept various payment methods including credit/debit cards, UPI, net banking, and digital wallets.
              </p>
              <p>
                All transactions are processed through secure payment gateways. Happy Feet does not store your payment information.
              </p>
              <p>
                In case of payment failures or disputes, please contact our customer support team immediately.
              </p>
            </CardContent>
          </Card>

          {/* Shipping and Delivery */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Truck className="w-5 h-5 text-purple-600" />
                <span>4. Shipping and Delivery</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We offer shipping across India. Delivery times may vary based on location and product availability.
              </p>
              <p>
                Free shipping is available on orders above ₹999. Standard shipping charges apply for orders below this amount.
              </p>
              <p>
                Once shipped, you will receive tracking information via email and SMS. Please ensure someone is available to receive the package at the delivery address.
              </p>
              <p>
                Happy Feet is not responsible for delays caused by courier services, natural disasters, or other circumstances beyond our control.
              </p>
            </CardContent>
          </Card>

          {/* Return and Exchange Policy */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-red-800">
                <AlertTriangle className="w-5 h-5" />
                <span>5. Return and Exchange Policy</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-red-700">
              <div className="bg-red-100 p-4 rounded-lg">
                <p className="font-bold text-lg mb-2">NO RETURNS | NO EXCHANGES</p>
                <p>
                  All sales are final. We do not accept returns, exchanges, or refunds for any reason, including but not limited to:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Change of mind</li>
                  <li>Wrong size selection</li>
                  <li>Color preference</li>
                  <li>Style preference</li>
                  <li>Damaged packaging (if product is undamaged)</li>
                </ul>
              </div>
              <p>
                Please carefully review product descriptions, size charts, and images before making your purchase. If you have any questions about a product, please contact our customer support team before ordering.
              </p>
              <p>
                In exceptional cases of manufacturing defects or shipping damage, please contact us within 24 hours of delivery with photographic evidence. Each case will be reviewed individually.
              </p>
            </CardContent>
          </Card>

          {/* User Responsibilities */}
          <Card>
            <CardHeader>
              <CardTitle>6. User Responsibilities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                You are responsible for providing accurate and complete information during the ordering process, including delivery address and contact details.
              </p>
              <p>
                You must be at least 18 years old to make a purchase or have parental/guardian consent.
              </p>
              <p>
                You agree not to use our website for any unlawful purposes or in any way that could damage our reputation or services.
              </p>
            </CardContent>
          </Card>

          {/* Privacy and Data Protection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-purple-600" />
                <span>7. Privacy and Data Protection</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We are committed to protecting your privacy and personal information. Please refer to our Privacy Policy for detailed information about how we collect, use, and protect your data.
              </p>
              <p>
                By using our services, you consent to the collection and use of your information as outlined in our Privacy Policy.
              </p>
            </CardContent>
          </Card>

          {/* Limitation of Liability */}
          <Card>
            <CardHeader>
              <CardTitle>8. Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Happy Feet shall not be liable for any indirect, incidental, special, or consequential damages arising from the use of our products or services.
              </p>
              <p>
                Our total liability for any claim shall not exceed the amount paid for the specific product or service in question.
              </p>
            </CardContent>
          </Card>

          {/* Governing Law */}
          <Card>
            <CardHeader>
              <CardTitle>9. Governing Law</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                These terms and conditions are governed by the laws of India. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts in Mumbai, Maharashtra.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Phone className="w-5 h-5 text-purple-600" />
                <span>10. Contact Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                If you have any questions about these Terms & Conditions, please contact us:
              </p>
              <div className="bg-gray-100 p-4 rounded-lg space-y-2">
                <p><strong>Email:</strong> support@happyfeet.com</p>
                <p><strong>Phone:</strong> +91 9876543210 </p>
                <p><strong>WhatsApp:</strong> <a href="https://wa.me/919876543210 " className="text-purple-600 hover:underline" target="_blank" rel="noopener noreferrer">+91 9876543210 </a></p>
              </div>
            </CardContent>
          </Card>

          {/* Acknowledgment */}
          <Card className="border-purple-200 bg-purple-50">
            <CardContent className="p-6">
              <p className="text-purple-800 font-semibold">
                By making a purchase on Happy Feet, you acknowledge that you have read, understood, and agree to be bound by these Terms & Conditions, including our NO RETURN | NO EXCHANGE policy.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}