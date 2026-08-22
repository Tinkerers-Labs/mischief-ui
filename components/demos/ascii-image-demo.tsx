"use client"

import { AsciiImage } from "@/registry/default/ascii-image/ascii-image"

export function AsciiImageDemo() {
  return (
    <div className="w-full max-w-sm">
      <AsciiImage
        src="/demo/gallery/impossible-checkbox.png"
        alt="The impossible checkbox experiment, drawn as characters"
        className="aspect-square"
        cell={7}
      />
    </div>
  )
}
