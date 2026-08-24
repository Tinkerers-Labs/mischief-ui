"use client"

import { NumberTicker } from "@/registry/default/number-ticker/number-ticker"

export function InterfacesCount({
  value,
  label,
}: {
  value: number
  label: string
}) {
  return (
    <span className="flex flex-col">
      <NumberTicker
        value={value}
        className="font-[family-name:var(--font-display)] text-[2.4rem] leading-none font-semibold tracking-[-0.04em]"
      />
      <span className="text-muted-foreground mt-1.5 text-xs font-semibold tracking-wide uppercase">
        {label}
      </span>
    </span>
  )
}
