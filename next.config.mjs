/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    // Enable better chunk loading
    optimizeCss: true,
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
  },
  // Environment variables for Puppeteer in production
  env: {
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD: process.env.NODE_ENV === 'production' ? 'true' : 'false',
    PUPPETEER_EXECUTABLE_PATH: process.env.NODE_ENV === 'production' ? '/usr/bin/chromium-browser' : undefined,
  },
}

export default nextConfig
