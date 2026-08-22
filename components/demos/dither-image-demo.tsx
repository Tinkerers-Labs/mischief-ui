"use client"

import { DitherImage } from "@/registry/default/dither-image/dither-image"

export function DitherImageDemo() {
  return (
    <div className="w-full max-w-md">
      <DitherImage
        src="/brand/mischief-social-preview.png"
        alt="The Mischief mark and wordmark, reduced to two tones"
        className="aspect-[2/1]"
        cell={3}
      />
      <p className="text-muted-foreground mt-3 text-xs">
        Two theme colours and an ordered dither, the way a newspaper did it.
      </p>
    </div>
  )
}
