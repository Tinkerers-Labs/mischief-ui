import * as React from "react"

import { cn } from "@/lib/utils"

export type FooterWordmarkProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> & {
  children: string
}

/**
 * The oversized brand word that closes a page, drawn at a fraction of the
 * surrounding text colour and clipped by the edge. It is texture rather than
 * content, so it is hidden from assistive technology and unselectable.
 */
export function FooterWordmark({
  children,
  className,
  ...rootProps
}: FooterWordmarkProps) {
  return (
    <div
      aria-hidden="true"
      data-slot="footer-wordmark"
      className={cn(
        "overflow-hidden text-center text-[clamp(5rem,17vw,15rem)] leading-[0.72] font-semibold tracking-[-0.075em] whitespace-nowrap text-[color-mix(in_oklab,currentColor_7%,transparent)] select-none",
        className
      )}
      {...rootProps}
    >
      {children}
    </div>
  )
}
