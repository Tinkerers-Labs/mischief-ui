"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export type ConnectionBeamProps = Omit<
  React.SVGAttributes<SVGSVGElement>,
  "children"
> & {
  /** The positioned box both endpoints live inside. */
  containerRef: React.RefObject<HTMLElement | null>
  fromRef: React.RefObject<HTMLElement | null>
  toRef: React.RefObject<HTMLElement | null>
  /** How far the path bows away from the straight line, in pixels. */
  curvature?: number
  /** Which edges to leave from and arrive at. Auto picks by the longer axis. */
  anchor?: "auto" | "horizontal" | "vertical"
  /** Pixels of clearance left at each end, so the path does not touch. */
  inset?: number
  /** The line that is always there. A theme token, or any CSS colour. */
  pathColor?: string
  /** The part that travels. */
  beamColor?: string
  width?: number
  /** Seconds for one trip. */
  duration?: number
  /** Seconds before the first trip. */
  delay?: number
  /** Sends it from the second element to the first. */
  reverse?: boolean
  /** How much of the path the travelling part covers, from nought to one. */
  extent?: number
}

type Geometry = { width: number; height: number; d: string }

/** Where a beam should leave a box, given which way it is heading. */
function edgePoint(
  rect: DOMRect,
  origin: DOMRect,
  towards: DOMRect,
  horizontal: boolean,
  inset: number
) {
  const x = rect.left - origin.left
  const y = rect.top - origin.top
  const midX = x + rect.width / 2
  const midY = y + rect.height / 2

  if (horizontal) {
    const rightwards =
      towards.left + towards.width / 2 > rect.left + rect.width / 2
    return {
      x: rightwards ? x + rect.width + inset : x - inset,
      y: midY,
    }
  }

  const downwards =
    towards.top + towards.height / 2 > rect.top + rect.height / 2
  return {
    x: midX,
    y: downwards ? y + rect.height + inset : y - inset,
  }
}

/**
 * A line drawn between two elements, with something travelling along it.
 *
 * The geometry is read from the elements themselves rather than given as
 * coordinates, so the diagram survives reflow: change the layout, resize the
 * window, wrap the boxes onto another line, and the beam follows.
 */
export function ConnectionBeam({
  containerRef,
  fromRef,
  toRef,
  curvature = 60,
  anchor = "auto",
  inset = 4,
  pathColor = "--border",
  beamColor = "--primary",
  width = 2,
  duration = 3,
  delay = 0,
  reverse = false,
  extent = 0.18,
  className,
  style,
  ...svgProps
}: ConnectionBeamProps) {
  const [geometry, setGeometry] = React.useState<Geometry | null>(null)

  React.useEffect(() => {
    const container = containerRef.current
    const from = fromRef.current
    const to = toRef.current
    if (!container || !from || !to) return

    const measure = () => {
      const origin = container.getBoundingClientRect()
      const a = from.getBoundingClientRect()
      const b = to.getBoundingClientRect()

      const horizontal =
        anchor === "auto"
          ? Math.abs(b.left + b.width / 2 - (a.left + a.width / 2)) >=
            Math.abs(b.top + b.height / 2 - (a.top + a.height / 2))
          : anchor === "horizontal"

      const start = edgePoint(a, origin, b, horizontal, inset)
      const end = edgePoint(b, origin, a, horizontal, inset)

      // The control point sits off the midpoint, square to the run, so the
      // bow is the same whichever way round the two elements are.
      const midX = (start.x + end.x) / 2
      const midY = (start.y + end.y) / 2
      const controlX = horizontal ? midX : midX + curvature
      const controlY = horizontal ? midY - curvature : midY

      setGeometry({
        width: origin.width,
        height: origin.height,
        d: `M ${start.x},${start.y} Q ${controlX},${controlY} ${end.x},${end.y}`,
      })
    }

    measure()

    // Either endpoint moving, or the box around them changing shape, moves
    // the line. Watching all three covers reflow without polling.
    const observer = new ResizeObserver(measure)
    observer.observe(container)
    observer.observe(from)
    observer.observe(to)

    window.addEventListener("resize", measure)
    return () => {
      observer.disconnect()
      window.removeEventListener("resize", measure)
    }
  }, [anchor, containerRef, curvature, fromRef, inset, toRef])

  if (!geometry) return null

  const colour = (value: string) =>
    value.startsWith("--") ? `var(${value})` : value

  // pathLength normalises the dashes, so the travelling part is a share of the
  // line rather than a number of pixels that means something different on
  // every screen.
  const covered = Math.min(Math.max(extent, 0.01), 1) * 100

  return (
    <svg
      data-slot="connection-beam"
      aria-hidden="true"
      width={geometry.width}
      height={geometry.height}
      viewBox={`0 0 ${geometry.width} ${geometry.height}`}
      fill="none"
      className={cn("pointer-events-none absolute top-0 left-0", className)}
      style={style}
      {...svgProps}
    >
      <path
        d={geometry.d}
        stroke={colour(pathColor)}
        strokeWidth={width}
        strokeLinecap="round"
      />
      <path
        d={geometry.d}
        stroke={colour(beamColor)}
        strokeWidth={width}
        strokeLinecap="round"
        pathLength={100}
        strokeDasharray={`${covered} ${100 - covered}`}
        className={cn(
          "motion-safe:animate-[mischief-connection-beam_var(--beam-duration)_linear_infinite]",
          // Standing still, the travelling part would just be a stray dash.
          "motion-reduce:hidden",
          reverse && "[animation-direction:reverse]"
        )}
        style={
          {
            "--beam-duration": `${duration}s`,
            animationDelay: `${delay}s`,
            strokeDashoffset: 100,
          } as React.CSSProperties
        }
      />
    </svg>
  )
}
