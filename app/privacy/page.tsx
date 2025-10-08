import { Navbar } from '@/components/ui/navbar'
import { Footer } from '@/components/ui/footer'
import { Database, MessageSquare, Share2, Shield, Cookie, UserCheck, Baby, FileEdit, Mail } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-gray-600 text-lg">Last updated: January 2025</p>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-xl shadow-sm border">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                <Database className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Information We Collect</h2>
                <p className="text-gray-600">We collect information you provide directly to us, including name, email address, phone number, shipping address, and payment information when you create an account or place an order.</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">2. How We Use Your Information</h2>
                <p className="text-gray-600">We use the information we collect to process your orders, communicate with you, improve our services, and send you marketing communications (with your consent).</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                <Share2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Information Sharing</h2>
                <p className="text-gray-600">We do not sell your personal information. We may share your information with service providers who assist us in operating our website and conducting our business.</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Data Security</h2>
                <p className="text-gray-600">We implement appropriate security measures to protect your personal information. However, no method of transmission over the internet is 100% secure.</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                <Cookie className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Cookies</h2>
                <p className="text-gray-600">We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. You can control cookies through your browser settings.</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                <UserCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Your Rights</h2>
                <p className="text-gray-600">You have the right to access, update, or delete your personal information. Contact us at support@onestopfashion.com to exercise these rights.</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                <Baby className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Children's Privacy</h2>
                <p className="text-gray-600">Our services are not directed to children under 18. We do not knowingly collect personal information from children.</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                <FileEdit className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Changes to Privacy Policy</h2>
                <p className="text-gray-600">We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page.</p>
              </div>
            </div>
          </div>

          <div className="bg-black text-white p-8 rounded-xl">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-black" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-3">9. Contact Us</h2>
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
