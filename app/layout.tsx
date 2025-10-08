import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/AuthContext"
import { AdminAuthProvider } from "@/contexts/AdminAuthContext"
import { CartProvider } from "@/contexts/CartContext"
import { WishlistProvider } from "@/contexts/WishlistContext"
import { Toaster } from "@/components/ui/toaster"
import { RazorpayScript } from "@/components/razorpay-script"


export const metadata: Metadata = {
  title: "Happy Feet - Fashion & Lifestyle Store",
  description: "Discover the latest trends in fashion, footwear, and lifestyle products. Shop from a curated collection of premium brands.",
  keywords: "fashion, clothing, shoes, lifestyle, shopping, online store",
  authors: [{ name: "Happy Feet Team" }],
  openGraph: {
    title: "Happy Feet - Fashion & Lifestyle Store",
    description: "Discover the latest trends in fashion, footwear, and lifestyle products.",
    type: "website",
    locale: "en_US",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className="overflow-x-hidden">
      <body className="font-sans overflow-x-hidden">
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <AuthProvider>
              <AdminAuthProvider>
                <CartProvider>
                  <WishlistProvider>
                    {children}
                    <Toaster />
                    <RazorpayScript />
                  </WishlistProvider>
                </CartProvider>
              </AdminAuthProvider>
            </AuthProvider>
          </ThemeProvider>
        </body>
    </html>
  )
}
