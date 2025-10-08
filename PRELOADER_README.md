# Happy Feet Preloader Animation

A beautiful, animated preloader component for the Happy Feet e-commerce website featuring the brand logo with smooth animations.

## Features

- ✨ Animated Happy Feet logo with pulse effect
- 👣 Walking feet animation with alternating steps
- 📝 Smooth fade-in text animation
- ⚡ Bouncing loading dots
- 📱 Responsive and mobile-friendly design
- 🎨 Clean, modern UI with full-screen overlay

## Components

### 1. Preloader Component

The main preloader component with all animations.

**Location:** `components/ui/preloader.tsx`

**Props:**
- `isLoading?: boolean` - Controls visibility of the preloader (default: true)

**Usage:**
```tsx
import Preloader from '@/components/ui/preloader';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  
  return (
    <div>
      <Preloader isLoading={isLoading} />
      {/* Your app content */}
    </div>
  );
}
```

### 2. PreloaderWrapper Component

A wrapper component that handles loading states and minimum display time.

**Location:** `components/ui/preloader-wrapper.tsx`

**Props:**
- `children: React.ReactNode` - Content to show after loading
- `showPreloader?: boolean` - Whether to show the preloader
- `minLoadingTime?: number` - Minimum time to show preloader in milliseconds (default: 1000)

**Usage:**
```tsx
import PreloaderWrapper from '@/components/ui/preloader-wrapper';

function MyPage() {
  const [isLoading, setIsLoading] = useState(true);
  
  return (
    <PreloaderWrapper showPreloader={isLoading} minLoadingTime={1500}>
      <div>
        <h1>Page Content</h1>
        <p>This content will show after the preloader finishes.</p>
      </div>
    </PreloaderWrapper>
  );
}
```

## Demo

Visit `/preloader-demo` to see the preloader in action with interactive controls.

## Animations

The preloader includes several custom CSS animations defined in `app/globals.css`:

- **pulse-slow**: Gentle pulsing effect for the logo
- **fade-in-text**: Smooth text appearance animation
- **bounce-feet**: Bouncing animation for the feet icons
- **step-left/step-right**: Alternating walking animation for feet

## Customization

### Colors
To customize colors, modify the `fill` attributes in the SVG paths within the Preloader component.

### Animation Speed
Adjust animation durations in the CSS keyframes in `globals.css`:

```css
.animate-pulse-slow {
  animation: pulse-slow 2s ease-in-out infinite; /* Change 2s to desired duration */
}
```

### Logo
To use a different logo, replace the SVG content in the Preloader component with your own SVG markup.

## Integration Examples

### 1. Page-level Loading
```tsx
// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import PreloaderWrapper from '@/components/ui/preloader-wrapper';

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <PreloaderWrapper showPreloader={isLoading}>
      {/* Your page content */}
    </PreloaderWrapper>
  );
}
```

### 2. Route Transitions
```tsx
// Use with Next.js router events
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Preloader from '@/components/ui/preloader';

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    const handleStart = () => setIsLoading(true);
    const handleComplete = () => setIsLoading(false);
    
    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);
    
    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleComplete);
    };
  }, [router]);
  
  return (
    <>
      <Preloader isLoading={isLoading} />
      <Component {...pageProps} />
    </>
  );
}
```

### 3. Data Fetching
```tsx
// Use with data fetching hooks
import { useState, useEffect } from 'react';
import PreloaderWrapper from '@/components/ui/preloader-wrapper';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .finally(() => setIsLoading(false));
  }, []);
  
  return (
    <PreloaderWrapper showPreloader={isLoading}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </PreloaderWrapper>
  );
}
```

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Performance

- Lightweight SVG animations
- CSS-only animations (no JavaScript animation loops)
- Optimized for 60fps performance
- Mobile-friendly with hardware acceleration

## Accessibility

- Respects `prefers-reduced-motion` media query
- Semantic HTML structure
- Screen reader friendly
- Keyboard navigation support

To add reduced motion support, add this CSS:

```css
@media (prefers-reduced-motion: reduce) {
  .animate-pulse-slow,
  .animate-bounce-feet,
  .animate-step-left,
  .animate-step-right {
    animation: none;
  }
}
```