"use client"

import { useState, useRef, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Loader2 } from 'lucide-react'
import dynamic from 'next/dynamic'
import type { Crop, PixelCrop } from 'react-image-crop'

// Dynamically import ReactCrop to avoid SSR issues
const ReactCrop = dynamic(
  () => import('react-image-crop').then((mod) => mod.default),
  { ssr: false }
)

interface BannerImageCropperProps {
  open: boolean
  onClose: () => void
  imageSrc: string
  onCropComplete: (croppedImage: string) => void
}

export function BannerImageCropper({
  open,
  onClose,
  imageSrc,
  onCropComplete
}: BannerImageCropperProps) {
  // Fixed aspect ratio for hero banner: 256x320 = 4:5 (portrait)
  const aspectRatio = 4 / 5
  const outputWidth = 256
  const outputHeight = 320
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 80,
    height: 100,
    x: 10,
    y: 0
  })
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [processing, setProcessing] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    // Load CSS dynamically
    import('react-image-crop/dist/ReactCrop.css')
  }, [])

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget
    const cropWidth = 80
    const cropHeight = (cropWidth * height) / width

    setCrop({
      unit: '%',
      width: cropWidth,
      height: Math.min(cropHeight, 100),
      x: 10,
      y: 0
    })
  }, [])

  const getCroppedImg = useCallback(async () => {
    if (!completedCrop || !imgRef.current) return

    setProcessing(true)

    const image = imgRef.current
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      setProcessing(false)
      return
    }

    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height

    // Set canvas size to fixed dimensions for hero banner
    canvas.width = outputWidth
    canvas.height = outputHeight

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    )

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setProcessing(false)
          return
        }

        const reader = new FileReader()
        reader.readAsDataURL(blob)
        reader.onloadend = () => {
          const base64data = reader.result as string
          onCropComplete(base64data)
          setProcessing(false)
          onClose()
        }
      },
      'image/jpeg',
      0.9
    )
  }, [completedCrop, onCropComplete, onClose])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Crop Banner Image</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex justify-center bg-gray-100 p-4 rounded-lg">
            {ReactCrop && (
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={aspectRatio}
                className="max-w-full"
              >
                <img
                  ref={imgRef}
                  src={imageSrc}
                  alt="Crop preview"
                  onLoad={onImageLoad}
                  className="max-w-full h-auto"
                />
              </ReactCrop>
            )}
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-16 h-20 bg-white border-2 border-blue-400 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="text-xs font-semibold text-blue-600">4:5</div>
                  <div className="text-[10px] text-gray-500">Portrait</div>
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">Hero Banner Crop</h4>
                <p className="text-gray-600 text-xs mb-2">
                  Output: <span className="font-mono font-semibold">256×320px</span> (Portrait)
                </p>
                <p className="text-gray-500 text-xs">
                  Drag the crop area to select the portion of the image that will appear in the hero carousel.
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose} disabled={processing}>
              Cancel
            </Button>
            <Button onClick={getCroppedImg} disabled={!completedCrop || processing}>
              {processing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Apply Crop
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
