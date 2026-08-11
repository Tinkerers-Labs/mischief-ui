"use client"

import * as React from "react"
import { Tabs } from "@base-ui/react/tabs"
import { clsx, type ClassValue } from "clsx"
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react"
import { twMerge } from "tailwind-merge"

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface MagneticTabItem {
  value: string
  label: React.ReactNode
  content: React.ReactNode
  disabled?: boolean
}

export interface MagneticTabsProps extends Omit<
  React.ComponentPropsWithoutRef<typeof Tabs.Root>,
  "children" | "defaultValue" | "onValueChange" | "value"
> {
  items: MagneticTabItem[]
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  className?: string
}

interface MagneticTabProps {
  item: MagneticTabItem
}

function MagneticTab({ item }: MagneticTabProps) {
  const prefersReducedMotion = useReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 500, damping: 34, mass: 0.35 })
  const springY = useSpring(y, { stiffness: 500, damping: 34, mass: 0.35 })

  function handlePointerMove(event: React.PointerEvent<HTMLButtonElement>) {
    if (prefersReducedMotion || event.pointerType !== "mouse") return

    const bounds = event.currentTarget.getBoundingClientRect()
    x.set(((event.clientX - bounds.left) / bounds.width - 0.5) * 6)
    y.set(((event.clientY - bounds.top) / bounds.height - 0.5) * 4)
  }

  function resetPosition() {
    x.set(0)
    y.set(0)
  }

  return (
    <Tabs.Tab
      data-slot="magnetic-tab"
      value={item.value}
      disabled={item.disabled}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPosition}
      className="text-muted-foreground hover:text-foreground focus-visible:ring-ring focus-visible:ring-offset-muted data-active:text-foreground relative z-10 min-h-11 flex-1 cursor-default rounded-[calc(var(--radius)-0.25rem)] px-4 py-2 text-sm font-medium whitespace-nowrap outline-none select-none focus-visible:ring-2 focus-visible:ring-offset-2 data-disabled:pointer-events-none data-disabled:opacity-45"
    >
      <motion.span
        className="inline-flex"
        style={prefersReducedMotion ? undefined : { x: springX, y: springY }}
      >
        {item.label}
      </motion.span>
    </Tabs.Tab>
  )
}

export const MagneticTabs = React.forwardRef<
  React.ComponentRef<typeof Tabs.Root>,
  MagneticTabsProps
>(function MagneticTabs(
  { items, defaultValue, value, onValueChange, className, ...rootProps },
  forwardedRef
) {
  const firstEnabledItem = items.find((item) => !item.disabled)

  if (!firstEnabledItem) return null

  return (
    <Tabs.Root
      {...rootProps}
      data-slot="magnetic-tabs"
      ref={forwardedRef}
      value={value}
      defaultValue={defaultValue ?? firstEnabledItem.value}
      onValueChange={(nextValue) => {
        if (typeof nextValue === "string") onValueChange?.(nextValue)
      }}
      className={cn("w-full", className)}
    >
      <Tabs.List
        activateOnFocus
        data-slot="magnetic-tabs-list"
        className="bg-muted relative isolate flex w-full rounded-[var(--radius)] p-1"
      >
        {items.map((item) => (
          <MagneticTab key={item.value} item={item} />
        ))}
        <Tabs.Indicator
          data-slot="magnetic-tabs-indicator"
          renderBeforeHydration
          className="border-border/70 bg-background absolute top-1 bottom-1 left-0 -z-0 w-[var(--active-tab-width)] translate-x-[var(--active-tab-left)] rounded-[calc(var(--radius)-0.25rem)] border shadow-sm transition-[width,translate] duration-200 ease-out motion-reduce:transition-none"
        />
      </Tabs.List>

      <div
        data-slot="magnetic-tabs-panels"
        className="bg-card text-card-foreground mt-3 overflow-hidden rounded-[var(--radius)] border"
      >
        {items.map((item) => (
          <Tabs.Panel
            data-slot="magnetic-tabs-panel"
            key={item.value}
            value={item.value}
            className="focus-visible:ring-ring p-5 text-sm leading-6 transition-[opacity,translate] duration-200 ease-out outline-none focus-visible:ring-2 focus-visible:ring-inset data-[ending-style]:-translate-y-1 data-[ending-style]:opacity-0 data-[starting-style]:translate-y-1 data-[starting-style]:opacity-0 motion-reduce:transition-none"
          >
            {item.content}
          </Tabs.Panel>
        ))}
      </div>
    </Tabs.Root>
  )
})
