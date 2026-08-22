"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type SurfaceContextType = "2d" | "webgl" | "none"

export type SurfaceContextFor<K extends SurfaceContextType> = K extends "2d"
  ? CanvasRenderingContext2D
  : K extends "webgl"
    ? WebGLRenderingContext
    : null

export type SurfaceSize = {
  /** CSS pixels. The backing store is this multiplied by dpr. */
  width: number
  height: number
  dpr: number
}

export type SurfaceArgs<TState, K extends SurfaceContextType> = {
  canvas: HTMLCanvasElement
  context: SurfaceContextFor<K>
  size: SurfaceSize
  state: TState
  /** Seconds of drawing time. Time spent paused or off screen does not count. */
  time: number
  /** Seconds since the previous frame, clamped to avoid a jump after a pause. */
  delta: number
}

export type RenderSurfaceProps<
  TState,
  K extends SurfaceContextType = "2d",
> = Omit<React.HTMLAttributes<HTMLDivElement>, "children"> & {
  contextType?: K
  /**
   * Builds whatever the drawing needs. Runs again whenever the canvas is
   * resized or a lost GPU context is restored, so it must not assume it is
   * only ever called once.
   */
  setup: (args: {
    canvas: HTMLCanvasElement
    context: SurfaceContextFor<K>
    size: SurfaceSize
  }) => TState
  draw: (args: SurfaceArgs<TState, K>) => void
  teardown?: (state: TState) => void
  /** Highest backing-store scale to use. Above 2 costs far more than it shows. */
  maxDpr?: number
  /**
   * Whether a resize rebuilds the state. Off for a setup that owns a scarce
   * resource, such as a renderer holding one of the browser's few GPU
   * contexts, which has to survive a resize rather than be built again.
   */
  rebuildOnResize?: boolean
  /**
   * Change this to ask for one more frame. Needed by any surface whose content
   * arrives late, because under reduced motion a single frame is painted, and
   * a picture that had not loaded by then would never appear at all.
   */
  revision?: string | number
  paused?: boolean
  /** Marks the canvas as meaningful content rather than decoration. */
  label?: string
  canvasClassName?: string
}

const MAX_DELTA = 1 / 15

function readDpr(max: number) {
  if (typeof window === "undefined") return 1
  return Math.min(window.devicePixelRatio || 1, max)
}

/**
 * Runs a draw loop against a canvas that stays the size of its box, sleeps
 * whenever it is off screen or its tab is hidden, and paints a single frame
 * instead of animating when the reader has asked for reduced motion.
 */
export function RenderSurface<TState, K extends SurfaceContextType = "2d">({
  contextType,
  setup,
  draw,
  teardown,
  maxDpr = 2,
  rebuildOnResize = true,
  revision,
  paused = false,
  label,
  className,
  canvasClassName,
  ...rootProps
}: RenderSurfaceProps<TState, K>) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [visible, setVisible] = React.useState(true)
  const [reduced, setReduced] = React.useState(false)

  // Read through refs so a caller may pass inline functions without the loop
  // tearing down and rebuilding on every render.
  const latest = React.useRef({ setup, draw, teardown })
  React.useEffect(() => {
    latest.current = { setup, draw, teardown }
  })

  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)")
    const sync = () => setReduced(query.matches)

    sync()
    query.addEventListener("change", sync)
    return () => query.removeEventListener("change", sync)
  }, [])

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry?.isIntersecting ?? true),
      { rootMargin: "128px" }
    )

    observer.observe(canvas)
    return () => observer.disconnect()
  }, [])

  const kind = contextType ?? ("2d" as K)
  const asleep = paused || !visible
  const repaint = React.useRef<(() => void) | null>(null)
  const controls = React.useRef<{ start: () => void; stop: () => void } | null>(
    null
  )

  // Sleeping is read through a ref so it can change without tearing the canvas
  // down. Resizing the backing store clears it, so a surface that paints once
  // and then stops would otherwise be wiped by the very act of stopping.
  const asleepRef = React.useRef(asleep)
  React.useEffect(() => {
    asleepRef.current = asleep
  })

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = (
      kind === "none"
        ? null
        : canvas.getContext(kind === "webgl" ? "webgl" : "2d", {
            alpha: true,
            antialias: true,
          })
    ) as SurfaceContextFor<K>

    if (kind !== "none" && context === null) return

    let state: TState | undefined
    let size: SurfaceSize = { width: 0, height: 0, dpr: readDpr(maxDpr) }
    let raf = 0
    let last = 0
    let elapsed = 0
    let disposed = false

    const measure = () => {
      const rect = canvas.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return false

      const dpr = readDpr(maxDpr)
      canvas.width = Math.round(rect.width * dpr)
      canvas.height = Math.round(rect.height * dpr)
      size = { width: rect.width, height: rect.height, dpr }
      return true
    }

    const build = () => {
      if (!measure()) return false

      if (state !== undefined) latest.current.teardown?.(state)
      state = latest.current.setup({ canvas, context, size })
      return true
    }

    const paint = (timestamp: number) => {
      if (state === undefined) return

      const delta =
        last === 0 ? 0 : Math.min((timestamp - last) / 1000, MAX_DELTA)
      last = timestamp
      elapsed += delta

      latest.current.draw({
        canvas,
        context,
        size,
        state,
        time: elapsed,
        delta,
      })
    }

    const loop = (timestamp: number) => {
      paint(timestamp)
      raf = window.requestAnimationFrame(loop)
    }

    const start = () => {
      if (disposed || raf !== 0) return
      last = 0

      if (reduced) {
        raf = window.requestAnimationFrame((timestamp) => {
          raf = 0
          paint(timestamp)
        })
        return
      }

      raf = window.requestAnimationFrame(loop)
    }

    const stop = () => {
      if (raf !== 0) window.cancelAnimationFrame(raf)
      raf = 0
    }

    const onLost = (event: Event) => {
      event.preventDefault()
      stop()
      state = undefined
    }

    const onRestored = () => {
      if (build()) start()
    }

    const onVisibility = () => {
      if (document.visibilityState === "hidden") stop()
      else if (!asleepRef.current) start()
    }

    if (!build()) return

    repaint.current = () => {
      if (disposed || state === undefined) return
      window.requestAnimationFrame(paint)
    }

    const resize = new ResizeObserver(() => {
      stop()
      if (!(rebuildOnResize ? build() : measure())) return

      // Resizing the backing store clears it, so a sleeping surface has just
      // lost whatever it was showing and needs one frame to put it back.
      if (asleepRef.current) window.requestAnimationFrame(paint)
      else start()
    })

    resize.observe(canvas)
    canvas.addEventListener("webglcontextlost", onLost)
    canvas.addEventListener("webglcontextrestored", onRestored)
    document.addEventListener("visibilitychange", onVisibility)

    controls.current = { start, stop }
    if (!asleepRef.current) start()

    return () => {
      disposed = true
      repaint.current = null
      controls.current = null
      stop()
      resize.disconnect()
      canvas.removeEventListener("webglcontextlost", onLost)
      canvas.removeEventListener("webglcontextrestored", onRestored)
      document.removeEventListener("visibilitychange", onVisibility)
      if (state !== undefined) latest.current.teardown?.(state)
    }
  }, [kind, maxDpr, rebuildOnResize, reduced])

  React.useEffect(() => {
    if (asleep) controls.current?.stop()
    else controls.current?.start()
  }, [asleep])

  React.useEffect(() => {
    repaint.current?.()
  }, [revision])

  return (
    <div
      data-slot="render-surface"
      className={cn("relative isolate overflow-hidden", className)}
      {...rootProps}
    >
      <canvas
        ref={canvasRef}
        data-slot="render-surface-canvas"
        role={label ? "img" : "presentation"}
        aria-label={label}
        aria-hidden={label ? undefined : true}
        className={cn("block size-full", canvasClassName)}
      />
    </div>
  )
}

/** Straight sRGB, each channel from 0 to 1, ready to hand to a shader. */
export type SurfaceColor = readonly [number, number, number]

const BLACK: SurfaceColor = [0, 0, 0]

let scratch: CanvasRenderingContext2D | null | undefined

/**
 * Converts any colour the browser understands into plain channels, including
 * the oklch and color-mix values shadcn themes are written in. Painting one
 * pixel and reading it back is the only route that stays correct as CSS gains
 * colour spaces, so the browser does the conversion rather than this file.
 */
export function resolveColor(value: string): SurfaceColor {
  const input = value.trim()
  if (input === "") return BLACK

  if (scratch === undefined) {
    scratch = document.createElement("canvas").getContext("2d", {
      willReadFrequently: true,
    })
  }

  if (!scratch) return BLACK

  scratch.clearRect(0, 0, 1, 1)
  scratch.fillStyle = "#000"
  scratch.fillStyle = input
  scratch.fillRect(0, 0, 1, 1)

  const [r, g, b] = scratch.getImageData(0, 0, 1, 1).data
  return [(r ?? 0) / 255, (g ?? 0) / 255, (b ?? 0) / 255]
}

/**
 * Reads theme custom properties off a mounted element and keeps them current
 * across a theme change, so a scene recolours itself to the application it was
 * installed into instead of carrying its own palette.
 */
export function useThemeColors<const Names extends readonly string[]>(
  ref: React.RefObject<HTMLElement | null>,
  names: Names
): Record<Names[number], SurfaceColor> {
  const key = names.join(",")

  const read = React.useCallback(() => {
    const element = ref.current
    const found = {} as Record<Names[number], SurfaceColor>
    if (!element) return found

    const styles = getComputedStyle(element)
    for (const name of key.split(",") as Names[number][]) {
      found[name] = resolveColor(styles.getPropertyValue(name))
    }

    return found
  }, [key, ref])

  const [colors, setColors] = React.useState<
    Record<Names[number], SurfaceColor>
  >({} as Record<Names[number], SurfaceColor>)

  React.useEffect(() => {
    const sync = () => setColors(read())
    sync()

    const observer = new MutationObserver(sync)
    observer.observe(document.documentElement, {
      attributeFilter: ["class", "style", "data-theme"],
    })

    return () => observer.disconnect()
  }, [read])

  return colors
}

export function colorOf(
  colors: Record<string, SurfaceColor>,
  name: string,
  fallback: SurfaceColor = BLACK
): SurfaceColor {
  return colors[name] ?? fallback
}

export type QuadProgram = {
  program: WebGLProgram
  uniform: (name: string) => WebGLUniformLocation | null
  /** Binds the program and the quad, then draws it across the viewport. */
  paint: (width: number, height: number, dpr: number) => void
  dispose: () => void
}

const QUAD_VERTEX = `
attribute vec2 aPosition;
varying vec2 vUv;
void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) return null

  gl.shaderSource(shader, source)
  gl.compileShader(shader)

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader)
    return null
  }

  return shader
}

/**
 * Builds a program that covers the canvas with one rectangle, which is all a
 * background shader ever needs. Returns null rather than throwing when the
 * driver refuses the shader, so a caller can fall back to plain markup.
 */
export function createQuadProgram(
  gl: WebGLRenderingContext,
  fragmentSource: string
): QuadProgram | null {
  const vertex = compile(gl, gl.VERTEX_SHADER, QUAD_VERTEX)
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource)
  const program = gl.createProgram()

  if (!vertex || !fragment || !program) return null

  gl.attachShader(program, vertex)
  gl.attachShader(program, fragment)
  gl.linkProgram(program)
  gl.deleteShader(vertex)
  gl.deleteShader(fragment)

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program)
    return null
  }

  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 3, -1, -1, 3]),
    gl.STATIC_DRAW
  )

  const position = gl.getAttribLocation(program, "aPosition")
  const cache = new Map<string, WebGLUniformLocation | null>()

  return {
    program,
    uniform: (name) => {
      if (!cache.has(name))
        cache.set(name, gl.getUniformLocation(program, name))
      return cache.get(name) ?? null
    },
    paint: (width, height, dpr) => {
      gl.viewport(0, 0, Math.round(width * dpr), Math.round(height * dpr))
      gl.useProgram(program)
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
      gl.enableVertexAttribArray(position)
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    },
    dispose: () => {
      gl.deleteBuffer(buffer)
      gl.deleteProgram(program)
    },
  }
}
