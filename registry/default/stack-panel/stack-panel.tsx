"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"

export interface StackPanelProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "title"
> {
  /** The heading of the first page. */
  title: React.ReactNode
  /** Read before the previous page's title on the back button. */
  backLabel?: string
  children: React.ReactNode
}

export interface StackPanelItemProps {
  /** The row's text, and the title of the page it opens. */
  label: React.ReactNode
  /** A title for the opened page when it should differ from the label. */
  title?: React.ReactNode
  /** A value shown at the end of the row, such as On or English. */
  detail?: React.ReactNode
  icon?: React.ReactNode
  /** A stable id for the page. Defaults to one React generates. */
  value?: string
  /** Runs for a row that opens no page. */
  onSelect?: () => void
  disabled?: boolean
  className?: string
  /** The page this row opens. A row without children opens nothing. */
  children?: React.ReactNode
}

type PanelContextValue = {
  path: readonly string[]
  push: (depth: number, id: string) => void
  pop: () => void
  exiting: { depth: number; id: string } | null
  finishExit: () => void
  /** True once, for the row whose page was just closed. */
  claimFocus: (id: string) => boolean
  layer: HTMLElement | null
  animate: boolean
  backLabel: string
}

type PageContextValue = { depth: number; title: React.ReactNode }

const PanelContext = React.createContext<PanelContextValue | null>(null)
const PageContext = React.createContext<PageContextValue>({
  depth: 0,
  title: null,
})

const reducedQuery = "(prefers-reduced-motion: reduce)"

function subscribeReduced(onChange: () => void) {
  const query = window.matchMedia(reducedQuery)
  query.addEventListener("change", onChange)
  return () => query.removeEventListener("change", onChange)
}

function canAnimate() {
  return (
    typeof Element.prototype.animate === "function" &&
    !window.matchMedia(reducedQuery).matches
  )
}

const EASE = "cubic-bezier(0.2, 0.8, 0.2, 1)"
const DURATION = 260

/** The transform that puts the heading where the row's label is. */
function flight(heading: HTMLElement | null, from: HTMLElement | null) {
  if (!heading || !from) return null
  const a = from.getBoundingClientRect()
  const b = heading.getBoundingClientRect()
  if (b.height === 0) return null
  const scale = Math.min(Math.max(a.height / b.height, 0.6), 1.4)
  return `translate(${a.left - b.left}px, ${a.top - b.top}px) scale(${scale})`
}

function isEditable(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  return (
    target.isContentEditable ||
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  )
}

/**
 * A panel that drills into nested pages the way a phone's settings do. Each
 * row that has children opens them as the next page, under the row's own
 * label, and Back retraces the way.
 */
export function StackPanel({
  title,
  backLabel = "Back to",
  className,
  children,
  onKeyDown,
  ...rootProps
}: StackPanelProps) {
  const [path, setPath] = React.useState<readonly string[]>([])
  const [exiting, setExiting] =
    React.useState<PanelContextValue["exiting"]>(null)
  const [layer, setLayer] = React.useState<HTMLElement | null>(null)
  const returnFocus = React.useRef<string | null>(null)
  const animate = React.useSyncExternalStore(
    subscribeReduced,
    canAnimate,
    () => false
  )

  const push = React.useCallback((depth: number, id: string) => {
    setExiting(null)
    setPath((current) => [...current.slice(0, depth), id])
  }, [])

  const pop = React.useCallback(() => {
    const id = path[path.length - 1]
    if (id === undefined) return
    returnFocus.current = id
    if (animate) setExiting({ depth: path.length - 1, id })
    setPath(path.slice(0, -1))
  }, [animate, path])

  const finishExit = React.useCallback(() => setExiting(null), [])

  const claimFocus = React.useCallback((id: string) => {
    if (returnFocus.current !== id) return false
    returnFocus.current = null
    return true
  }, [])

  const value = React.useMemo<PanelContextValue>(
    () => ({
      path,
      push,
      pop,
      exiting,
      finishExit,
      claimFocus,
      layer,
      animate,
      backLabel,
    }),
    [
      animate,
      backLabel,
      claimFocus,
      exiting,
      finishExit,
      layer,
      path,
      pop,
      push,
    ]
  )

  return (
    <PanelContext.Provider value={value}>
      <div
        data-slot="stack-panel"
        data-depth={path.length}
        className={cn(
          "bg-background text-foreground border-border relative isolate grid grid-cols-1 grid-rows-[minmax(0,1fr)] overflow-hidden rounded-[var(--radius)] border",
          className
        )}
        onKeyDown={(event) => {
          onKeyDown?.(event)
          if (event.defaultPrevented || path.length === 0) return
          if (
            event.key === "Escape" ||
            (event.key === "Backspace" && !isEditable(event.target))
          ) {
            event.preventDefault()
            event.stopPropagation()
            pop()
          }
        }}
        {...rootProps}
      >
        <StackPanelPage depth={0} title={title} parentTitle={null}>
          {children}
        </StackPanelPage>
        <div ref={setLayer} className="contents" />
      </div>
    </PanelContext.Provider>
  )
}

function StackPanelPage({
  depth,
  title,
  parentTitle,
  origin,
  leaving = false,
  children,
}: {
  depth: number
  title: React.ReactNode
  parentTitle: React.ReactNode
  origin?: React.RefObject<HTMLElement | null>
  leaving?: boolean
  children: React.ReactNode
}) {
  const panel = React.useContext(PanelContext)
  const id = React.useId()
  const sectionRef = React.useRef<HTMLElement>(null)
  const headingRef = React.useRef<HTMLHeadingElement>(null)
  const bodyRef = React.useRef<HTMLDivElement>(null)
  const entered = React.useRef(false)
  const pathLength = panel?.path.length ?? 0
  const state = leaving ? "exiting" : pathLength > depth ? "covered" : "open"
  const animate = panel?.animate ?? false
  const finishExit = panel?.finishExit

  React.useLayoutEffect(() => {
    if (depth === 0 || entered.current) return
    entered.current = true
    if (animate) {
      const section = sectionRef.current
      const from = flight(headingRef.current, origin?.current ?? null)
      section?.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: 180,
        easing: "ease-out",
      })
      bodyRef.current?.animate(
        [{ transform: "translateX(1.5rem)" }, { transform: "none" }],
        { duration: DURATION, easing: EASE }
      )
      if (from) {
        headingRef.current?.animate(
          [{ transform: from }, { transform: "none" }],
          { duration: DURATION, easing: EASE }
        )
      }
    }
    headingRef.current?.focus({ preventScroll: true })
  }, [animate, depth, origin])

  React.useLayoutEffect(() => {
    if (!leaving) return
    const section = sectionRef.current
    if (!section) return
    const to = flight(headingRef.current, origin?.current ?? null)
    const fade = section.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: 220,
      easing: "ease-in",
      fill: "forwards",
    })
    bodyRef.current?.animate(
      [{ transform: "none" }, { transform: "translateX(1.5rem)" }],
      { duration: 220, easing: "ease-in", fill: "forwards" }
    )
    if (to) {
      headingRef.current?.animate([{ transform: "none" }, { transform: to }], {
        duration: 220,
        easing: EASE,
        fill: "forwards",
      })
    }
    let done = false
    void fade.finished
      .catch(() => undefined)
      .then(() => {
        if (!done) finishExit?.()
      })
    return () => {
      done = true
    }
  }, [finishExit, leaving, origin])

  return (
    <section
      ref={sectionRef}
      aria-labelledby={`${id}-title`}
      data-slot="stack-panel-page"
      data-state={state}
      data-depth={depth}
      inert={state !== "open"}
      className="bg-background flex min-h-0 flex-col [grid-area:1/1]"
      style={{ zIndex: depth }}
    >
      <header
        data-slot="stack-panel-header"
        className="border-border flex min-h-12 items-center gap-1 border-b px-2"
      >
        {depth > 0 ? (
          <button
            type="button"
            data-slot="stack-panel-back"
            className="text-primary hover:bg-muted focus-visible:ring-ring inline-flex min-h-9 max-w-[45%] shrink-0 items-center gap-0.5 rounded-md pr-2 pl-1 text-sm transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none motion-reduce:transition-none"
            onClick={() => panel?.pop()}
          >
            <ChevronLeft aria-hidden="true" className="size-5 shrink-0" />
            <span className="sr-only">{panel?.backLabel}</span>{" "}
            <span className="truncate">{parentTitle}</span>
          </button>
        ) : null}
        <h2
          ref={headingRef}
          id={`${id}-title`}
          tabIndex={-1}
          data-slot="stack-panel-title"
          className={cn(
            "min-w-0 flex-1 origin-top-left truncate text-base font-semibold outline-none",
            depth === 0 && "px-2"
          )}
        >
          {title}
        </h2>
      </header>
      <div
        ref={bodyRef}
        data-slot="stack-panel-body"
        className="min-h-0 flex-1 overflow-y-auto"
      >
        <PageContext.Provider value={{ depth, title }}>
          {children}
        </PageContext.Provider>
      </div>
    </section>
  )
}

export function StackPanelItem({
  label,
  title,
  detail,
  icon,
  value,
  onSelect,
  disabled,
  className,
  children,
}: StackPanelItemProps) {
  const panel = React.useContext(PanelContext)
  const page = React.useContext(PageContext)
  const generated = React.useId()
  const id = value ?? generated
  const rowRef = React.useRef<HTMLButtonElement>(null)
  const labelRef = React.useRef<HTMLSpanElement>(null)
  const opens =
    children !== undefined && children !== null && children !== false
  const open = opens && panel?.path[page.depth] === id
  const leaving =
    opens &&
    panel?.exiting?.id === id &&
    panel.exiting.depth === page.depth &&
    !open

  React.useEffect(() => {
    if (!open && panel?.claimFocus(id)) {
      rowRef.current?.focus({ preventScroll: true })
    }
  }, [id, open, panel])

  const content = (
    <>
      {icon ? (
        <span
          aria-hidden="true"
          className="text-muted-foreground flex size-5 shrink-0 items-center justify-center [&_svg]:size-5"
        >
          {icon}
        </span>
      ) : null}
      <span
        ref={labelRef}
        className="min-w-0 flex-1 origin-top-left truncate font-medium"
      >
        {label}
      </span>
      {detail !== undefined ? (
        <span className="text-muted-foreground max-w-[45%] shrink-0 truncate">
          {detail}
        </span>
      ) : null}
      {opens ? (
        <ChevronRight
          aria-hidden="true"
          className="text-muted-foreground size-4 shrink-0"
        />
      ) : null}
    </>
  )

  const rowClass = cn(
    "border-border flex min-h-11 w-full items-center gap-3 border-b px-4 py-2.5 text-left text-sm",
    className
  )

  if (!opens && !onSelect) {
    return (
      <div data-slot="stack-panel-item" className={rowClass}>
        {content}
      </div>
    )
  }

  return (
    <>
      <button
        ref={rowRef}
        type="button"
        disabled={disabled}
        data-slot="stack-panel-item"
        data-state={open ? "open" : undefined}
        className={cn(
          rowClass,
          "hover:bg-muted/60 focus-visible:bg-muted focus-visible:ring-ring transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none"
        )}
        onClick={() => {
          if (opens) panel?.push(page.depth, id)
          else onSelect?.()
        }}
      >
        {content}
      </button>
      {(open || leaving) && panel?.layer
        ? createPortal(
            <StackPanelPage
              depth={page.depth + 1}
              title={title ?? label}
              parentTitle={page.title}
              origin={labelRef}
              leaving={leaving}
            >
              {children}
            </StackPanelPage>,
            panel.layer
          )
        : null}
    </>
  )
}
