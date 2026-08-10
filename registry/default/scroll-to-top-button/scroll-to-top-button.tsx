"use client"

import * as React from "react"
import { ArrowUpToLine } from "lucide-react"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface ScrollToTopButtonProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> {
  containerRef?: React.RefObject<HTMLElement | null>
  behavior?: ScrollBehavior
  label?: string
  showAfter?: number
}

export const ScrollToTopButton = React.forwardRef<
  HTMLButtonElement,
  ScrollToTopButtonProps
>(function ScrollToTopButton(
  {
    behavior = "smooth",
    className,
    containerRef,
    label = "Scroll to top",
    onClick,
    showAfter = 320,
    type = "button",
    ...buttonProps
  },
  forwardedRef
) {
  const [visible, setVisible] = React.useState(false)

  React.useEffect(() => {
    const container = containerRef?.current
    const scrollTarget = container ?? window

    function updateVisibility() {
      const scrollTop = container?.scrollTop ?? window.scrollY
      setVisible(scrollTop > showAfter)
    }

    updateVisibility()
    scrollTarget.addEventListener("scroll", updateVisibility, { passive: true })

    return () => scrollTarget.removeEventListener("scroll", updateVisibility)
  }, [containerRef, showAfter])

  function scrollToTop(event: React.MouseEvent<HTMLButtonElement>) {
    onClick?.(event)
    if (event.defaultPrevented) return

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
    const scrollBehavior = reduceMotion ? "instant" : behavior
    const container = containerRef?.current

    if (container) {
      container.scrollTo({ top: 0, behavior: scrollBehavior })
      return
    }

    window.scrollTo({ top: 0, behavior: scrollBehavior })
  }

  if (!visible) return null

  return (
    <button
      aria-label={label}
      className={cn(
        "group bg-foreground text-background fixed right-6 bottom-6 z-40 inline-flex size-12 items-center justify-center rounded-full shadow-[0_1px_0_oklch(0.215_0.018_58/18%),0_10px_30px_oklch(0.215_0.018_58/18%)] transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] motion-reduce:transition-none",
        className
      )}
      onClick={scrollToTop}
      ref={forwardedRef}
      title={label}
      type={type}
      {...buttonProps}
    >
      <ArrowUpToLine
        aria-hidden="true"
        className="transition-transform duration-150 group-hover:-translate-y-0.5 motion-reduce:transition-none"
        size={19}
        strokeWidth={2}
      />
    </button>
  )
})
