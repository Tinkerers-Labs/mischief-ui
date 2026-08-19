"use client"

import { DemoVariants } from "@/components/demos/demo-variants"
import { TokenMeter } from "@/registry/default/token-meter/token-meter"

export function TokenMeterDemo() {
  return (
    <DemoVariants
      label="Usage"
      variants={[
        {
          id: "segments",
          label: "By part",
          render: () => (
            <div className="w-full max-w-sm">
              <TokenMeter
                limit={200_000}
                segments={[
                  { label: "System", value: 4_200 },
                  { label: "History", value: 71_000 },
                  { label: "Files", value: 18_400 },
                ]}
              />
            </div>
          ),
        },
        {
          id: "plain",
          label: "Total only",
          render: () => (
            <div className="w-full max-w-sm">
              <TokenMeter used={38_000} limit={200_000} />
            </div>
          ),
        },
        {
          id: "tight",
          label: "Running out",
          render: () => (
            <div className="w-full max-w-sm">
              <TokenMeter used={186_500} limit={200_000} />
            </div>
          ),
        },
      ]}
    />
  )
}
