"use client"

import { FooterRow } from "@/registry/default/footer-row/footer-row"

const products = [
  { label: "Maillayer", href: "#" },
  { label: "Post Scheduler", href: "#" },
  { label: "Traffic Source", href: "#" },
  { label: "Meta Tags", href: "#" },
  { label: "Blog CMS", href: "#" },
]

export function FooterRowDemo() {
  return (
    <div className="w-full max-w-2xl">
      <FooterRow label="Other products" links={products} />
    </div>
  )
}
