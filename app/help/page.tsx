"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Navbar } from '@/components/ui/navbar'
import { TopHeader } from '@/components/ui/top-header'
import { Footer } from '@/components/ui/footer'
import { 
  Search, 
  MessageSquare, 
  Phone, 
  Mail, 
  Package, 
  CreditCard, 
  Truck, 
  RotateCcw, 
  Shield, 
  HelpCircle,
  ExternalLink
} from 'lucide-react'

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const helpCategories = [
    {
      title: "Orders & Shipping",
      icon: Package,
      questions: [
        {
          question: "How can I track my order?",
          answer: "You can track your order by visiting our Track Order page and entering your order ID. You'll also receive tracking updates via email and SMS."
        },
        {
          question: "What are the delivery charges?",
          answer: "We offer free delivery on orders above ₹999. For orders below this amount, standard delivery charges of ₹99 apply."
        },
        {
          question: "How long does delivery take?",
          answer: "Standard delivery takes 3-7 business days. Express delivery (1-3 days) is available for select locations at additional cost."
        },
        {
          question: "Can I change my delivery address?",
          answer: "You can change your delivery address within 2 hours of placing the order. After that, please contact our support team."
        }
      ]
    },
    {
      title: "Returns & Exchanges",
      icon: RotateCcw,
      questions: [
        {
          question: "What is your return policy?",
          answer: "Please refer to our Terms & Conditions page for detailed information about our return and exchange policy."
        },
        {
          question: "How do I initiate a return?",
          answer: "Contact our customer support team via WhatsApp or email to initiate a return. Please have your order details ready."
        },
        {
          question: "When will I receive my refund?",
          answer: "Refunds are processed within 5-7 business days after we receive the returned item in good condition."
        }
      ]
    },
    {
      title: "Payment & Pricing",
      icon: CreditCard,
      questions: [
        {
          question: "What payment methods do you accept?",
          answer: "We accept all major credit/debit cards, UPI, net banking, and digital wallets through our secure payment gateway."
        },
        {
          question: "Is it safe to pay online?",
          answer: "Yes, all payments are processed through secure, encrypted channels. We use industry-standard security measures to protect your data."
        },
        {
          question: "Can I pay cash on delivery?",
          answer: "Cash on delivery is available for select locations and orders above ₹500. Additional charges may apply."
        }
      ]
    },
    {
      title: "Account & Profile",
      icon: Shield,
      questions: [
        {
          question: "How do I create an account?",
          answer: "Click on 'Register' in the top menu and fill in your details. You can also create an account during checkout."
        },
        {
          question: "I forgot my password. What should I do?",
          answer: "Click on 'Forgot Password' on the login page and enter your email. We'll send you a reset link."
        },
        {
          question: "How do I update my profile information?",
          answer: "Log in to your account and go to 'My Account' > 'Settings' to update your personal information."
        }
      ]
    }
  ]

  const filteredCategories = helpCategories.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => 
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <TopHeader />
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Help Center</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Find answers to frequently asked questions or get in touch with our support team.
          </p>
          
          {/* Search */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 py-3 text-lg"
            />
          </div>
        </div>

        {/* Quick Contact */}
        <div className="mb-12">
          <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
            <CardContent className="p-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Need Immediate Help?</h2>
                <p className="text-purple-100 mb-6">Our support team is ready to assist you</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a 
                    href="https://wa.me/919173803878

 " 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                  >
                    <MessageSquare className="w-5 h-5" />
                    <span>WhatsApp Support</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <a 
                    href="tel:+919173803878

 "
                    className="inline-flex items-center justify-center space-x-2 bg-white text-purple-600 px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
                  >
                    <Phone className="w-5 h-5" />
                    <span>Call Us</span>
                  </a>
                  <a 
                    href="mailto:support@onestopfashionbrand.com"
                    className="inline-flex items-center justify-center space-x-2 bg-white text-purple-600 px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
                  >
                    <Mail className="w-5 h-5" />
                    <span>Email Us</span>
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-8">
          {(searchQuery ? filteredCategories : helpCategories).map((category, categoryIndex) => {
            const IconComponent = category.icon
            return (
              <Card key={categoryIndex}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <IconComponent className="w-6 h-6 text-purple-600" />
                    <span>{category.title}</span>
                    <Badge variant="secondary">{category.questions.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {category.questions.map((faq, faqIndex) => (
                      <AccordionItem key={faqIndex} value={`item-${categoryIndex}-${faqIndex}`}>
                        <AccordionTrigger className="text-left">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-600">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Still Need Help */}
        <div className="mt-12">
          <Card>
            <CardContent className="p-8 text-center">
              <HelpCircle className="w-16 h-16 text-purple-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Still Need Help?</h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Can't find what you're looking for? Our customer support team is here to help you with any questions or concerns.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild className="bg-purple-600 hover:bg-purple-700">
                  <a href="/contact">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Contact Support
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="https://wa.me/919173803878

 " target="_blank" rel="noopener noreferrer">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    WhatsApp Chat
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}