"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"

export interface FloatingIndexItem {
  id: string
  label: string
  icon?: React.ReactNode
}

export interface FloatingIndexProps extends Omit<
  React.ComponentPropsWithoutRef<"nav">,
  "onChange"
> {
  items: FloatingIndexItem[]
  label?: string
  /**
   * Once the reader is into the page, the trigger says which section they are
   * in rather than repeating the label. On by default.
   */
  showActiveLabel?: boolean
  activeId?: string
  defaultActiveId?: string
  onActiveChange?: (id: string) => void
  container?: HTMLElement | null
  containerRef?: React.RefObject<HTMLElement | null>
}

export const FloatingIndex = React.forwardRef<HTMLElement, FloatingIndexProps>(
  function FloatingIndex(
    {
      items,
      label = "Index",
      showActiveLabel = true,
      activeId: controlledActiveId,
      defaultActiveId,
      onActiveChange,
      container,
      containerRef,
      className,
      "aria-label": ariaLabel,
      ...navProps
    },
    forwardedRef
  ) {
    const [open, setOpen] = React.useState(false)
    const [progress, setProgress] = React.useState(0)
    const [uncontrolledActiveId, setUncontrolledActiveId] = React.useState(
      defaultActiveId ?? items[0]?.id ?? ""
    )
    const contentId = React.useId()
    const prefersReducedMotion = useReducedMotion()
    const activeId = controlledActiveId ?? uncontrolledActiveId
    const activeIdRef = React.useRef(activeId)

    React.useEffect(() => {
      activeIdRef.current = activeId
    }, [activeId])

    const updateActiveId = React.useCallback(
      (id: string) => {
        if (activeIdRef.current === id) return
        activeIdRef.current = id
        if (controlledActiveId === undefined) setUncontrolledActiveId(id)
        onActiveChange?.(id)
      },
      [controlledActiveId, onActiveChange]
    )

    React.useEffect(() => {
      const root = container ?? containerRef?.current ?? null
      const targets = items
        .map((item) => document.getElementById(item.id))
        .filter((target): target is HTMLElement => target !== null)

      if (targets.length === 0) return

      const observer = new IntersectionObserver(
        (entries) => {
          const visibleEntry = entries
            .filter((entry) => entry.isIntersecting)
            .sort(
              (first, second) =>
                first.boundingClientRect.top - second.boundingClientRect.top
            )[0]

          if (visibleEntry) updateActiveId(visibleEntry.target.id)
        },
        {
          root,
          rootMargin: "-20% 0px -70% 0px",
          threshold: 0,
        }
      )

      targets.forEach((target) => observer.observe(target))
      return () => observer.disconnect()
    }, [container, containerRef, items, updateActiveId])

    React.useEffect(() => {
      const root = container ?? containerRef?.current ?? null
      const scrollTarget: HTMLElement | Window = root ?? window
      let frame = 0

      function readProgress() {
        const scrollTop = root ? root.scrollTop : window.scrollY
        const scrollHeight = root
          ? root.scrollHeight - root.clientHeight
          : document.documentElement.scrollHeight - window.innerHeight
        const nextProgress =
          scrollHeight > 0 ? Math.min(scrollTop / scrollHeight, 1) : 0

        setProgress(nextProgress)
        if (nextProgress > 0.995 && items.at(-1)?.id) {
          updateActiveId(items.at(-1)!.id)
        }
      }

      function scheduleRead() {
        window.cancelAnimationFrame(frame)
        frame = window.requestAnimationFrame(readProgress)
      }

      readProgress()
      scrollTarget.addEventListener("scroll", scheduleRead, { passive: true })
      window.addEventListener("resize", scheduleRead)

      const resizeObserver = new ResizeObserver(scheduleRead)
      resizeObserver.observe(root ?? document.documentElement)

      return () => {
        window.cancelAnimationFrame(frame)
        scrollTarget.removeEventListener("scroll", scheduleRead)
        window.removeEventListener("resize", scheduleRead)
        resizeObserver.disconnect()
      }
    }, [container, containerRef, items, updateActiveId])

    function navigateTo(item: FloatingIndexItem) {
      const target = document.getElementById(item.id)
      if (!target) return

      updateActiveId(item.id)

      if (prefersReducedMotion) {
        target.scrollIntoView({ behavior: "auto", block: "start" })
        setOpen(false)
        return
      }

      target.scrollIntoView({ behavior: "smooth", block: "start" })

      // Collapsing the panel while the scroll is in flight cancels it, and the
      // reader stays where they were having asked to be somewhere else. So the
      // panel closes once the scroll has landed instead.
      let settled = false
      const close = () => {
        if (settled) return
        settled = true
        window.removeEventListener("scrollend", close)
        window.clearTimeout(timer)
        setOpen(false)
      }

      const timer = window.setTimeout(close, 700)
      window.addEventListener("scrollend", close, { once: true })
    }

    const activeItem = items.find((item) => item.id === activeId)
    // At the top there is no section to be in yet, so the label stands.
    const triggerLabel =
      showActiveLabel && !open && progress > 0 && activeItem
        ? activeItem.label
        : label

    return (
      <nav
        {...navProps}
        aria-label={ariaLabel ?? label}
        data-slot="floating-index"
        ref={forwardedRef}
        className={cn(
          "bg-foreground text-background border-background/15 fixed top-6 left-1/2 z-50 w-48 max-w-[calc(100vw-2rem)] -translate-x-1/2 overflow-hidden rounded-2xl border shadow-lg transition-[width] duration-200 motion-reduce:transition-none",
          open && "w-72",
          className
        )}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setOpen(false)
            event.currentTarget.querySelector<HTMLElement>("button")?.focus()
          }
        }}
      >
        <button
          data-slot="floating-index-trigger"
          type="button"
          aria-controls={contentId}
          aria-expanded={open}
          className="flex min-h-11 w-full items-center gap-3 rounded-2xl px-3 text-left text-sm font-semibold"
          disabled={items.length === 0}
          onClick={() => setOpen((current) => !current)}
        >
          <span className="relative flex size-6 shrink-0 items-center justify-center">
            <svg
              aria-hidden="true"
              className="absolute inset-0 -rotate-90"
              viewBox="0 0 24 24"
            >
              <circle
                cx="12"
                cy="12"
                r="9.5"
                fill="none"
                pathLength="100"
                stroke="currentColor"
                strokeWidth="2"
                className="opacity-20"
              />
              <circle
                cx="12"
                cy="12"
                r="9.5"
                fill="none"
                pathLength="100"
                stroke="currentColor"
                strokeDasharray="100"
                strokeDashoffset={100 - progress * 100}
                strokeLinecap="round"
                strokeWidth="2"
                className="transition-[stroke-dashoffset] duration-200 motion-reduce:transition-none"
              />
            </svg>
            <span className="bg-background size-1.5 rounded-full" />
          </span>

          <span className="min-w-0 flex-1 truncate">{triggerLabel}</span>
          <ChevronDown
            aria-hidden="true"
            className={cn(
              "size-4 shrink-0 transition-transform duration-200 motion-reduce:transition-none",
              open && "rotate-180"
            )}
            strokeWidth={1.8}
          />
          <span
            data-slot="floating-index-progress"
            className="bg-background/10 rounded-full px-2 py-1 text-xs font-bold tabular-nums"
          >
            {Math.round(progress * 100)}%
          </span>
        </button>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              data-slot="floating-index-content"
              id={contentId}
              initial={prefersReducedMotion ? false : { height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.18 }}
              className="overflow-hidden"
            >
              <div className="border-background/15 border-t p-2">
                {items.map((item) => (
                  <button
                    data-slot="floating-index-item"
                    type="button"
                    aria-current={activeId === item.id ? "location" : undefined}
                    className={cn(
                      "flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm transition-colors duration-150 motion-reduce:transition-none",
                      activeId === item.id
                        ? "bg-background text-foreground"
                        : "text-background/65 hover:text-background hover:bg-background/10"
                    )}
                    key={item.id}
                    onClick={() => navigateTo(item)}
                  >
                    {item.icon && (
                      <span className="flex size-5 shrink-0 items-center justify-center [&_svg]:size-4">
                        {item.icon}
                      </span>
                    )}
                    <span className="truncate">{item.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    )
  }
)
