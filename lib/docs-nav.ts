/**
 * The documentation's own pages, in reading order. The sidebar and the pager
 * both read this, so the order a reader is offered is the order they get.
 */
import type { Route } from "next"

export type DocsSection = {
  href: Route
  label: string
  summary: string
}

export const docsSections: readonly DocsSection[] = [
  {
    href: "/docs",
    label: "Introduction",
    summary: "What this collection is, and what every component holds to.",
  },
  {
    href: "/docs/installation",
    label: "Installation",
    summary: "The registry, the npm package, and the namespace.",
  },
  {
    href: "/docs/components",
    label: "Components",
    summary: "Everything here, by family.",
  },
] as const

export function docsNeighbours(href: string) {
  const at = docsSections.findIndex((section) => section.href === href)
  if (at === -1) return { previous: undefined, next: undefined }

  return {
    previous: docsSections[at - 1],
    next: docsSections[at + 1],
  }
}
