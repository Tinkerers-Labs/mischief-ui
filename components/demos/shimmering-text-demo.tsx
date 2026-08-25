"use client"

import { ShimmeringText } from "@/registry/default/shimmering-text/shimmering-text"

export function ShimmeringTextDemo() {
  return (
    <div className="w-full max-w-sm space-y-3 text-sm">
      <ShimmeringText>Reading the contract…</ShimmeringText>
      <br />
      <ShimmeringText duration={1.4} extent={0.5}>
        Checking the renewal window
      </ShimmeringText>
    </div>
  )
}
