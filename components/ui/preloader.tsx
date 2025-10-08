"use client"

import React from 'react'
import Image from 'next/image'

interface PreloaderProps {
  isLoading: boolean
}

const Preloader: React.FC<PreloaderProps> = ({ isLoading }) => {
  if (!isLoading) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-6">
        <div className="relative w-40 h-20 md:w-52 md:h-24">
          <Image
            src="/logo/happy-logo.png"
            alt="Happy Feet"
            fill
            className="object-contain"
            priority
          />
        </div>
        
        <div className="flex gap-2">
          <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  )
}

export default Preloader