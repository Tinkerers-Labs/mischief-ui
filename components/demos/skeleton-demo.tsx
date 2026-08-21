"use client"

import { DemoVariants } from "@/components/demos/demo-variants"
import { Skeleton } from "@/registry/default/skeleton/skeleton"

export function SkeletonDemo() {
  return (
    <DemoVariants
      label="Skeleton"
      variants={[
        {
          id: "card",
          label: "A card",
          render: () => (
            <div aria-busy="true" className="grid w-full max-w-sm gap-3">
              <Skeleton className="h-32" />
              <div className="flex items-center gap-3">
                <Skeleton className="size-10 shrink-0 rounded-full" />
                <Skeleton lines={2} className="flex-1" />
              </div>
            </div>
          ),
        },
        {
          id: "text",
          label: "A paragraph",
          render: () => (
            <div aria-busy="true" className="w-full max-w-sm">
              <Skeleton lines={4} />
            </div>
          ),
        },
      ]}
    />
  )
}
