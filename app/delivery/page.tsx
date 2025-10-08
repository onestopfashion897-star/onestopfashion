import { Navbar } from '@/components/ui/navbar'
import { Footer } from '@/components/ui/footer'
import { Clock, DollarSign, MapPin, Package, Truck, Mail } from 'lucide-react'

export default function DeliveryPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Delivery Information</h1>
          <p className="text-gray-600 text-lg">Fast and reliable delivery across India</p>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-xl shadow-sm border">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Delivery Timeline</h2>
                <p className="text-gray-600">All orders are delivered within 5-6 business days from the date of order confirmation. Delivery times may vary based on your location.</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Shipping Charges</h2>
                <p className="text-gray-600">We offer free shipping on all orders across India. No minimum order value required.</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Delivery Areas</h2>
                <p className="text-gray-600">We currently deliver to all major cities and towns across India. Please ensure your complete address with pincode is provided during checkout.</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Order Tracking</h2>
                <p className="text-gray-600">Once your order is shipped, you will receive a confirmation email with tracking details. You can also track your order from your account dashboard.</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Delivery Partners</h2>
                <p className="text-gray-600">We work with trusted courier partners to ensure safe and timely delivery of your orders.</p>
              </div>
            </div>
          </div>

          <div className="bg-black text-white p-8 rounded-xl">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-black" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-3">Contact Us</h2>
                <p className="text-gray-300 mb-4">For any delivery-related queries, please contact our customer support</p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a href="mailto:support@onestopfashion.com" className="text-white hover:text-gray-300">support@onestopfashion.com</a>
                  <span className="hidden sm:inline text-gray-500">|</span>
                  <a href="tel:+919876543210" className="text-white hover:text-gray-300">+91 98765 43210</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}
