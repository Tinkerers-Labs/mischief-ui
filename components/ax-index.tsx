"use client"

import {
  Boxes,
  CircleHelp,
  Gauge,
  Layers,
  ListChecks,
  Timer,
  TriangleAlert,
} from "lucide-react"

import { axSections } from "@/lib/ax"
import { FloatingIndex } from "@/registry/default/floating-index/floating-index"

const icons: Record<string, React.ReactNode> = {
  "what-it-is": <CircleHelp aria-hidden="true" />,
  "why-now": <Timer aria-hidden="true" />,
  principles: <ListChecks aria-hidden="true" />,
  mechanisms: <Layers aria-hidden="true" />,
  measuring: <Gauge aria-hidden="true" />,
  unsettled: <TriangleAlert aria-hidden="true" />,
  here: <Boxes aria-hidden="true" />,
}

export function AxIndex() {
  return (
    <FloatingIndex
      label="Contents"
      position="bottom-right"
      items={axSections.map((section) => ({
        id: section.id,
        label: section.title,
        icon: icons[section.id],
      }))}
    />
  )
}
