"use client"

import { galleryImages } from "@/components/demos/image-gallery-demo"
import { ImageGrid } from "@/registry/default/image-grid/image-grid"

export function ImageGridDemo() {
  return (
    <div className="w-full max-w-2xl">
      <ImageGrid images={galleryImages.slice(0, 6)} layout="masonry" />
    </div>
  )
}
