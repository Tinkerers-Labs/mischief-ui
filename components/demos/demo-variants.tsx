"use client"

import * as React from "react"

export type DemoVariant = {
  id: string
  label: string
  render: () => React.ReactNode
}

export function DemoVariants({
  variants,
  label = "Demo variant",
}: {
  variants: [DemoVariant, ...DemoVariant[]]
  label?: string
}) {
  const [activeId, setActiveId] = React.useState(variants[0].id)
  const active =
    variants.find((variant) => variant.id === activeId) ?? variants[0]

  return (
    <div className="grid w-full justify-items-center gap-6">
      <div className="w-full">{active.render()}</div>

      <div
        role="group"
        aria-label={label}
        className="border-border bg-background/70 inline-flex flex-wrap justify-center gap-1 rounded-full border p-1"
      >
        {variants.map((variant) => {
          const isActive = variant.id === active.id

          return (
            <button
              key={variant.id}
              type="button"
              aria-pressed={isActive}
              className={
                isActive
                  ? "bg-foreground text-background rounded-full px-3 py-1.5 text-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground rounded-full px-3 py-1.5 text-xs font-semibold"
              }
              onClick={() => setActiveId(variant.id)}
            >
              {variant.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
