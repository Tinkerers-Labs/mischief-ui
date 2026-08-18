"use client"

import { componentDemos } from "@/components/demos"

export function ComponentPreview({ slug }: { slug: string }) {
  const demo = componentDemos[slug]

  if (!demo) return null

  return <demo.Demo />
}
