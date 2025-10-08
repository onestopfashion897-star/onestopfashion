# One Stop Fashion - E-commerce Platform

A modern, full-stack e-commerce platform built with Next.js, TypeScript, and MongoDB. Features a complete shopping experience with user authentication, product management, cart functionality, payment integration, and admin dashboard.

## 🚀 Features

### Customer Features
- **User Authentication**: Register, login, and profile management
- **Product Browsing**: Browse products by category, brand, and search
- **Shopping Cart**: Add/remove items, quantity management
- **Wishlist**: Save favorite products for later
- **Order Management**: Track orders and view order history
- **Address Management**: Multiple shipping addresses
- **Payment Integration**: Secure payment processing with Razorpay
- **Responsive Design**: Mobile-first responsive UI

### Admin Features
- **Dashboard**: Analytics and overview
- **Product Management**: Add, edit, delete products
- **Category Management**: Organize products by categories
- **Brand Management**: Manage product brands
- **Order Management**: Process and track orders
- **Customer Management**: View and manage customers
- **Coupon System**: Create and manage discount coupons
- **Review Management**: Moderate product reviews
- **Reports**: Sales and analytics reports

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI Components
- **Backend**: Next.js API Routes
- **Database**: MongoDB
- **Authentication**: JWT, bcryptjs
- **Payment**: Razorpay Integration
- **State Management**: React Context API
- **Form Handling**: React Hook Form with Zod validation
- **UI Components**: Custom component library with shadcn/ui

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **pnpm** (recommended)
- **MongoDB** (local installation or MongoDB Atlas)
- **Razorpay Account** (for payment processing)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd onestopfashion
```

### 2. Install Dependencies

```bash
# Using npm
npm install

# Using pnpm (recommended)
pnpm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/stylehub

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here

# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
```

### 4. Database Setup

#### Option A: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. The application will automatically create the database

#### Option B: MongoDB Atlas
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in `.env.local`

### 5. Seed the Database

Run the seed script to populate the database with sample data:

```bash
# Using npm
npm run seed

# Using pnpm
pnpm seed
```

This will create:
- Admin user: `admin@stylehub.com` / `admin123`
- Sample user: `john@example.com` / `user123`
- Sample products, categories, and brands

### 6. Start the Development Server

```bash
# Using npm
npm run dev

# Using pnpm
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
onestopfashion/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── admin/             # Admin dashboard pages
│   ├── account/           # User account pages
│   ├── cart/              # Shopping cart
│   ├── checkout/          # Checkout process
│   ├── products/          # Product pages
│   └── layout.tsx         # Root layout
├── components/            # Reusable UI components
│   └── ui/               # shadcn/ui components
├── contexts/             # React contexts
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and configurations
├── scripts/              # Database seeding and utilities
└── public/               # Static assets
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run seed` - Seed database with sample data

## 🔐 Authentication

The application uses JWT-based authentication with the following endpoints:

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/admin/login` - Admin login
- `GET /api/auth/me` - Get current user

## 💳 Payment Integration

### Payment Methods
Currently, the application supports:
- **Cash on Delivery (COD)** - Default payment method for all orders

## 🎨 Customization

### Styling
The project uses Tailwind CSS with a custom design system. You can customize:

- Colors in `tailwind.config.ts`
- Component styles in `components/ui/`
- Global styles in `app/globals.css`

### Components
All UI components are built using shadcn/ui and can be customized in the `components/ui/` directory.

## 📱 Responsive Design

The application is fully responsive and optimized for:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation with Zod
- CORS protection
- Rate limiting (recommended for production)
- Secure payment processing

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

### CI/CD: GitHub Actions → VPS (Auto‑deploy)

This repo includes an Actions workflow at `.github/workflows/deploy.yml` that automatically deploys to your VPS on every push to `main`.

Prerequisites on the VPS
- Node.js `>=18` and `npm` installed (`node -v`, `npm -v`).
- PM2 installed globally (`npm i -g pm2`).
- App directory exists at `/var/www/onestopfashion` and is writable by your deploy user.
- Environment file on the server (e.g., `/var/www/onestopfashion/.env`) with production values.

Required GitHub Secrets (Repository → Settings → Secrets and variables → Actions)
- `VPS_HOST` – your server IP or hostname.
- `VPS_USER` – SSH username.
- `VPS_PORT` – SSH port (default `22`).
- `VPS_PASSWORD` – SSH password for the deploy user.
- `GIT_TOKEN` – Personal Access Token used for HTTPS clone/pull of the private repo.

Generate and add `GIT_TOKEN`
1. Go to `https://github.com/settings/tokens` → Generate new token (classic).
2. Note: any name like “VPS deploy token”; set an expiration (e.g., 90 days).
3. Scope: check `repo` (read access to private repos).
4. Generate and copy the token, then add it as the `GIT_TOKEN` secret in the repo.
   - For fine‑grained PATs, grant “Contents: Read” to this repository and use that token value.

What the workflow does
- Triggers on `push` to `main`.
- Connects to the VPS via SSH using `VPS_HOST`, `VPS_USER`, `VPS_PASSWORD`, `VPS_PORT`.
- Ensures the repo remote uses the token URL:
  `https://x-access-token:${{ secrets.GIT_TOKEN }}@github.com/kakkadpriyansh/OneStopFashion.git`.
- Runs `git fetch` and `git reset --hard origin/main` in `/var/www/onestopfashion`.
- Installs dependencies and builds:
  `npm ci --legacy-peer-deps || npm install --legacy-peer-deps && npm run build`.
- Restarts the app via PM2: `pm2 restart onestopfashion --update-env` (or starts it if missing) and `pm2 save`.

Why `--legacy-peer-deps`?
- The project uses React 19, and some packages (e.g., `vaul@0.9.x`) still declare peers up to React 18.
- Using legacy peer resolution allows installs to proceed in CI without blocking on peer mismatches.
- Long‑term, update or replace packages to versions compatible with React 19.

Troubleshooting
- npm ERESOLVE peer conflicts: Confirm the workflow includes `--legacy-peer-deps`; align dependencies when possible.
- Permission issues on `/var/www/onestopfashion`: ensure the deploy user owns the directory (`chown -R <user> /var/www/onestopfashion`).
- PM2 not found: install globally (`npm i -g pm2`) and ensure it’s on `PATH`.
- Token errors when pulling: verify `GIT_TOKEN` is valid, not expired, and has `repo` or fine‑grained Contents: Read access.
- Private repo via SSH (alternative): add the VPS public key as a GitHub Deploy Key and switch the remote to `git@github.com:<owner>/<repo>.git`.

## 📊 Database Schema

### Collections
- `users` - User accounts and profiles
- `admins` - Admin users
- `products` - Product catalog
- `categories` - Product categories
- `brands` - Product brands
- `orders` - Customer orders
- `carts` - Shopping cart data
- `wishlists` - User wishlists
- `coupons` - Discount coupons
- `reviews` - Product reviews

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code comments

## 🔄 Updates

Keep your dependencies updated:

```bash
npm update
# or
pnpm update
```

## 📝 Notes

- The application uses placeholder images from Unsplash
- Sample data is provided for demonstration
- Production deployment requires proper environment configuration
- Regular security updates are recommended

---

**One Stop Fashion** - Your complete e-commerce solution! 🛍️