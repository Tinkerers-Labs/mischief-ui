"use client"

import * as React from "react"
import { ArrowUpToLine } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ScrollToTopButtonProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> {
  containerRef?: React.RefObject<HTMLElement | null>
  container?: HTMLElement | null
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
    container,
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
    const scrollContainer = container ?? containerRef?.current
    const scrollTarget = scrollContainer ?? window

    function updateVisibility() {
      const scrollTop = scrollContainer?.scrollTop ?? window.scrollY
      setVisible(scrollTop > showAfter)
    }

    updateVisibility()
    scrollTarget.addEventListener("scroll", updateVisibility, { passive: true })

    return () => scrollTarget.removeEventListener("scroll", updateVisibility)
  }, [container, containerRef, showAfter])

  function scrollToTop(event: React.MouseEvent<HTMLButtonElement>) {
    onClick?.(event)
    if (event.defaultPrevented) return

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
    const scrollBehavior = reduceMotion ? "instant" : behavior
    const scrollContainer = container ?? containerRef?.current

    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: scrollBehavior })
      return
    }

    window.scrollTo({ top: 0, behavior: scrollBehavior })
  }

  // Kept in the page so it can fade rather than appear, and made completely
  // inert while hidden: not clickable, not focusable, not announced.
  return (
    <button
      aria-hidden={!visible || undefined}
      aria-label={label}
      data-slot="scroll-to-top-button"
      data-visible={visible || undefined}
      tabIndex={visible ? undefined : -1}
      className={cn(
        "group bg-foreground text-background fixed right-6 bottom-6 z-40 inline-flex size-12 items-center justify-center rounded-full shadow-lg transition-[opacity,transform] duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] motion-reduce:transition-none",
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-2 opacity-0",
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
