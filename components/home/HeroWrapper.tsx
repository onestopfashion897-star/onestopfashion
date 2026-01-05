"use client"

import dynamic from 'next/dynamic'

const ModernHero = dynamic(() => import('./ModernHero').then(m => m.ModernHero), {
  ssr: false,
  loading: () => <div className="h-[360px] md:h-[420px] bg-gray-100 rounded-2xl animate-pulse" />
})

export default function HeroWrapper() {
  return <ModernHero />
}