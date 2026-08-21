"use client"

import * as React from "react"

import { galleryImages } from "@/components/demos/image-gallery-demo"
import { ImageGrid } from "@/registry/default/image-grid/image-grid"
import { Lightbox } from "@/registry/default/lightbox/lightbox"

const images = galleryImages.slice(0, 4)

export function LightboxDemo() {
  const [openId, setOpenId] = React.useState<string | null>(null)
  const trigger = React.useRef<HTMLButtonElement>(null)

  return (
    <div className="w-full max-w-lg">
      <ImageGrid
        images={images}
        onSelect={(image, event) => {
          trigger.current = event.currentTarget
          setOpenId(image.id)
        }}
      />
      <Lightbox
        finalFocus={trigger}
        images={images}
        openId={openId}
        onOpenIdChange={setOpenId}
      />
    </div>
  )
}
