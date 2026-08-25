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
