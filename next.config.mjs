/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: false,
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
      { protocol: 'http', hostname: 'localhost' },
    ],
  },
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  env: {
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD: process.env.NODE_ENV === 'production' ? 'true' : 'false',
    PUPPETEER_EXECUTABLE_PATH: process.env.NODE_ENV === 'production' ? '/usr/bin/chromium-browser' : undefined,
  },
}

export default nextConfig
