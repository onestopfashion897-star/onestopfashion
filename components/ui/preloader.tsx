"use client"

interface PreloaderProps {
  isLoading: boolean
}

const Preloader: React.FC<PreloaderProps> = ({ isLoading }) => {
  if (!isLoading) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1a1a1a]">
      <div className="flex flex-col items-center gap-6">
        <img
          src="/logo/happy-logo.png"
          alt="Happy Feet"
          className="w-40 h-20 md:w-52 md:h-24 object-contain brightness-0 invert"
        />
        
        <div className="flex gap-2">
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  )
}

export default Preloader