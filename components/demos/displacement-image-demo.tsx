"use client"

import { DisplacementImage } from "@/registry/default/displacement-image/displacement-image"

export function DisplacementImageDemo() {
  return (
    <div className="w-full max-w-md">
      <DisplacementImage
        from="/demo/gallery/shift-button.png"
        to="/demo/gallery/floating-deck.png"
        alt="Shift Button crossing into Floating Deck"
        className="aspect-[4/3]"
      />
      <p className="text-muted-foreground mt-3 text-xs">
        Point at the image, or move focus onto it, to cross to the second one.
      </p>
    </div>
  )
}
