import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/AuthContext"
import { AdminAuthProvider } from "@/contexts/AdminAuthContext"
import { CartProvider } from "@/contexts/CartContext"
import { WishlistProvider } from "@/contexts/WishlistContext"
import { Toaster } from "@/components/ui/toaster"
// Razorpay script will be loaded only on checkout page to avoid extra JS on other routes
// import { RazorpayScript } from "@/components/razorpay-script"


export const metadata: Metadata = {
  title: "One Stop Fashion - Fashion & Lifestyle Store",
  description: "Discover the latest trends in fashion, footwear, and lifestyle products. Shop from a curated collection of premium brands.",
  keywords: "fashion, clothing, shoes, lifestyle, shopping, online store",
  authors: [{ name: "One Stop Fashion Team" }],
  openGraph: {
    title: "One Stop Fashion - Fashion & Lifestyle Store",
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
      <head></head>
      <body className="overflow-x-hidden font-sans">
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
                  </WishlistProvider>
                </CartProvider>
              </AdminAuthProvider>
            </AuthProvider>
          </ThemeProvider>
        </body>
    </html>
  )
}
