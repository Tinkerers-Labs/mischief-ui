"use client"

import { FloatingIndex } from "@/registry/default/floating-index/floating-index"
import { ScrollToTopButton } from "@/registry/default/scroll-to-top-button/scroll-to-top-button"

export function InterfacesIndex({
  items,
}: {
  items: readonly { id: string; label: string }[]
}) {
  return (
    <>
      {/* Bottom left, the way the gallery places it, rather than over the
          header where it sits by default. */}
      <FloatingIndex
        className="top-auto bottom-6 left-6 w-64 translate-x-0"
        items={[...items]}
        label="On this page"
      />
      <ScrollToTopButton />
    </>
  )
}
