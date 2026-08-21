"use client"

import { FooterWordmark } from "@/registry/default/footer-wordmark/footer-wordmark"

export function FooterWordmarkDemo() {
  return (
    <div className="bg-foreground text-background w-full overflow-hidden rounded-[var(--radius)] pt-8">
      <FooterWordmark className="text-[clamp(3rem,12vw,9rem)]">
        northstar
      </FooterWordmark>
    </div>
  )
}
