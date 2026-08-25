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
      {/* Bottom left, because the way back to the top sits in the other
          corner and two of these stacked is one too many. */}
      <FloatingIndex
        className="w-64"
        position="bottom-left"
        items={[...items]}
        label="On this page"
      />
      <ScrollToTopButton />
    </>
  )
}
