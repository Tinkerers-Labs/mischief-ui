"use client"

import * as React from "react"
import { NumberTicker } from "@/registry/default/number-ticker/number-ticker"

export function NumberTickerDemo() {
  const [multiplier, setMultiplier] = React.useState(1)

  return (
    <div className="grid w-full max-w-md gap-6">
      <dl className="grid grid-cols-3 gap-3 text-center">
        <div className="border-border bg-card rounded-[var(--radius)] border p-4">
          <dd className="text-2xl font-semibold">
            <NumberTicker value={12480 * multiplier} startOnView={false} />
          </dd>
          <dt className="text-muted-foreground mt-1 text-xs">Installs</dt>
        </div>
        <div className="border-border bg-card rounded-[var(--radius)] border p-4">
          <dd className="text-2xl font-semibold">
            <NumberTicker
              value={0.982}
              startOnView={false}
              format={{ style: "percent", maximumFractionDigits: 1 }}
            />
          </dd>
          <dt className="text-muted-foreground mt-1 text-xs">Uptime</dt>
        </div>
        <div className="border-border bg-card rounded-[var(--radius)] border p-4">
          <dd className="text-2xl font-semibold">
            <NumberTicker
              value={1499 * multiplier}
              startOnView={false}
              format={{ style: "currency", currency: "USD" }}
            />
          </dd>
          <dt className="text-muted-foreground mt-1 text-xs">Monthly</dt>
        </div>
      </dl>

      <button
        type="button"
        className="border-border mx-auto inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-semibold"
        onClick={() => setMultiplier((value) => (value === 1 ? 3 : 1))}
      >
        Change the numbers
      </button>
    </div>
  )
}
