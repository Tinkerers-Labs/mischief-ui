"use client"

import * as React from "react"
import {
  RenderSurface,
  useThemeColors,
  type SurfaceColor,
} from "@/registry/default/render-surface/render-surface"
import { cn } from "@/lib/utils"

export type LatticeFieldProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Pixels between dots. The lattice is rebuilt to suit whatever box it gets. */
  spacing?: number
  /** Diameter of a dot in pixels. */
  dotSize?: number
  color?: string
  /** The lagging second colour drawn behind. Same as color turns it off. */
  echoColor?: string
  /** How far the pointer reaches, in pixels. Zero turns the reaction off. */
  pointerRadius?: number
  /** Furthest a dot is pushed by the pointer, in pixels. */
  push?: number
  /** Pixels per second squared, once the lattice has been let go. */
  gravity?: number
  /** Pixels per second the dots leave the click at. */
  scatter?: number
  /** Whether a press breaks the lattice. */
  collapseOnClick?: boolean
  /** Multiplies the idle wave. Zero holds the lattice perfectly still. */
  sway?: number
  paused?: boolean
  surfaceClassName?: string
}

type Lattice = {
  /** Carried so teardown can release the pair, which is handed no context. */
  gl: WebGLRenderingContext
  program: WebGLProgram | null
  buffer: WebGLBuffer | null
  count: number
  columns: number
  rows: number
  uniform: (name: string) => WebGLUniformLocation | null
}

/*
 * The lattice never stores a position. Every dot's place is a function of its
 * cell, the clock, and the three numbers the pointer contributes, so a frame
 * costs one draw call and no state at all -- which is also why letting go can
 * be a simple mix back towards the grid rather than a simulation that has to
 * be unwound.
 */
const VERTEX = `
attribute vec2 aCell;

uniform vec2 uGrid;
uniform vec2 uResolution;
uniform float uDpr;
uniform vec2 uPointer;
uniform float uPointerActive;
uniform float uPointerRadius;
uniform float uPush;
uniform vec2 uOrigin;
uniform float uFall;
uniform float uCollapse;
uniform float uGravity;
uniform float uScatter;
uniform float uTime;
uniform float uSway;
uniform float uMotion;
uniform float uDotSize;

varying float vFade;

const float DRAG = 3.0;

float hash(vec2 seed) {
  return fract(sin(dot(seed, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  vec2 span = uResolution / uGrid;
  vec2 rest = (aCell + 0.5) * span;
  float grain = hash(aCell);

  // A slow wave so an untouched lattice still reads as a field. Two
  // frequencies, because a single one makes visible diagonal bands.
  vec2 sway = vec2(
    sin(uTime * 0.7 + rest.y * 0.012 + grain * 6.28),
    cos(uTime * 0.5 + rest.x * 0.010 + grain * 6.28)
  ) * uSway * uMotion;

  vec2 toPointer = rest - uPointer;
  float distance = length(toPointer);
  float reach = max(uPointerRadius, 0.0001);
  float falloff = smoothstep(reach, 0.0, distance);
  vec2 ripple =
    normalize(toPointer + vec2(0.0001)) *
    falloff * falloff * uPush * uPointerActive * uMotion;

  // Ballistic, not simulated: an outward kick that fades with distance from
  // the press, gravity on top, and a floor the dot is not allowed past.
  vec2 away = normalize(rest - uOrigin + vec2(0.0001));
  float nearness = smoothstep(reach * 3.0, 0.0, length(rest - uOrigin));
  vec2 velocity = away * uScatter * mix(0.35, 1.0, nearness);

  // The kick is dragged rather than carried, so its travel converges on
  // uScatter / DRAG instead of growing for as long as the press is held. A
  // constant velocity throws the whole lattice off the sides within a second,
  // which empties the box rather than filling its floor.
  float travel = (1.0 - exp(-DRAG * uFall)) / DRAG;
  vec2 thrown = rest + (
    velocity * travel + vec2(0.0, 0.5 * uGravity * uFall * uFall)
  ) * uMotion;

  // The floor and the two walls are set a little differently for every dot, so
  // what gathers against them reads as a heap rather than as one drawn line.
  float drift = hash(aCell.yx + 3.7);
  vec2 edge = span * 0.5 + span * vec2(drift, grain) * 2.0;
  thrown.x = clamp(thrown.x, edge.x, uResolution.x - edge.x);
  thrown.y = min(thrown.y, uResolution.y - edge.y);

  vec2 position = mix(rest + sway + ripple, thrown, uCollapse);

  vFade = mix(0.55 + falloff * 0.45 * uPointerActive, 1.0, uCollapse * 0.25);

  vec2 clip = position / uResolution * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
  gl_PointSize = uDotSize * uDpr;
}
`

const FRAGMENT = `
precision mediump float;

uniform vec3 uColor;
uniform float uAlpha;

varying float vFade;

void main() {
  float edge = length(gl_PointCoord - 0.5);
  float mask = smoothstep(0.5, 0.35, edge);
  if (mask <= 0.0) discard;

  // Premultiplied, which is how the canvas composites, so dots do not carry a
  // pale fringe over whatever they sit on.
  float alpha = mask * vFade * uAlpha;
  gl_FragColor = vec4(uColor * alpha, alpha);
}
`

const MAX_DOTS = 24000
const RETURN_SECONDS = 1.4

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

function createProgram(gl: WebGLRenderingContext) {
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX)
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT)
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

  return program
}

/** Widens the spacing until the lattice fits the budget, however big the box. */
function fit(width: number, height: number, spacing: number) {
  const step = Math.max(spacing, 2)
  const area = Math.max(width, 1) * Math.max(height, 1)
  const wanted = area / (step * step)
  const cell = wanted > MAX_DOTS ? Math.sqrt(area / MAX_DOTS) : step

  return {
    columns: Math.max(Math.floor(width / cell), 1),
    rows: Math.max(Math.floor(height / cell), 1),
  }
}

function easeOut(value: number) {
  const clamped = Math.min(Math.max(value, 0), 1)
  return 1 - Math.pow(1 - clamped, 3)
}

/**
 * A lattice of dots that holds its grid, parts around the pointer, and breaks
 * apart when pressed before settling back into place. Decoration: it sits
 * behind its children on its own layer and takes no pointer events itself.
 */
export function LatticeField({
  spacing = 16,
  dotSize = 2,
  color = "--foreground",
  echoColor = "--primary",
  pointerRadius = 140,
  push = 26,
  gravity = 1400,
  scatter = 320,
  collapseOnClick = true,
  sway = 1,
  paused,
  className,
  surfaceClassName,
  children,
  ...rootProps
}: LatticeFieldProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const pointer = React.useRef({ x: 0, y: 0, active: 0 })
  const press = React.useRef({
    held: false,
    x: 0,
    y: 0,
    startedAt: -1,
    releasedAt: -1,
    frozen: 0,
  })

  const tokens = React.useMemo(
    () => [color, echoColor].filter((entry) => entry.startsWith("--")),
    [color, echoColor]
  )

  const resolved = useThemeColors(rootRef, tokens)
  const ink = color.startsWith("--") ? resolved[color] : undefined
  const echo = echoColor.startsWith("--") ? resolved[echoColor] : undefined
  const ready = ink !== undefined && echo !== undefined

  const colors = React.useRef<{ ink: SurfaceColor; echo: SurfaceColor }>({
    ink: [0, 0, 0],
    echo: [0, 0, 0],
  })

  React.useEffect(() => {
    if (ink && echo) colors.current = { ink, echo }
  }, [ink, echo])

  React.useEffect(() => {
    if (pointerRadius <= 0 && !collapseOnClick) return

    const inside = (event: PointerEvent) => {
      const box = rootRef.current?.getBoundingClientRect()
      if (!box) return null

      const x = event.clientX - box.left
      const y = event.clientY - box.top
      const within = x >= 0 && x <= box.width && y >= 0 && y <= box.height

      return { x, y, within }
    }

    // Followed on the window rather than on this element, so the lattice still
    // answers while sitting behind something that takes every event itself.
    const move = (event: PointerEvent) => {
      const at = inside(event)
      if (!at) return

      pointer.current.x = at.x
      pointer.current.y = at.y
      pointer.current.active = at.within ? 1 : 0

      if (!at.within) press.current.held = false
    }

    const down = (event: PointerEvent) => {
      if (!collapseOnClick) return

      const at = inside(event)
      if (!at?.within) return

      press.current.x = at.x
      press.current.y = at.y
      press.current.held = !press.current.held
    }

    const leave = () => {
      pointer.current.active = 0
      press.current.held = false
    }

    window.addEventListener("pointermove", move, { passive: true })
    window.addEventListener("pointerdown", down, { passive: true })
    window.addEventListener("pointercancel", leave, { passive: true })

    return () => {
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerdown", down)
      window.removeEventListener("pointercancel", leave)
    }
  }, [collapseOnClick, pointerRadius])

  const setup = React.useCallback(
    ({
      context,
      size,
    }: {
      context: WebGLRenderingContext
      size: { width: number; height: number }
    }) => {
      const program = createProgram(context)
      const { columns, rows } = fit(size.width, size.height, spacing)

      const cells = new Float32Array(columns * rows * 2)
      for (let row = 0; row < rows; row += 1) {
        for (let column = 0; column < columns; column += 1) {
          const index = (row * columns + column) * 2
          cells[index] = column
          cells[index + 1] = row
        }
      }

      const buffer = context.createBuffer()
      context.bindBuffer(context.ARRAY_BUFFER, buffer)
      context.bufferData(context.ARRAY_BUFFER, cells, context.STATIC_DRAW)

      const cache = new Map<string, WebGLUniformLocation | null>()

      return {
        gl: context,
        program,
        buffer,
        count: columns * rows,
        columns,
        rows,
        uniform: (name: string) => {
          if (!program) return null
          if (!cache.has(name))
            cache.set(name, context.getUniformLocation(program, name))
          return cache.get(name) ?? null
        },
      } satisfies Lattice
    },
    [spacing]
  )

  const draw = React.useCallback(
    ({
      context,
      size,
      state,
      time,
    }: {
      context: WebGLRenderingContext
      size: { width: number; height: number; dpr: number }
      state: Lattice
      time: number
    }) => {
      const { program, buffer, count } = state
      if (!program || !buffer) return

      const { width, height, dpr } = size

      // The press is stamped by the loop rather than by the handler, so both
      // ends of the fall are measured on the clock that actually draws it.
      const held = press.current.held
      if (held && press.current.startedAt < 0) {
        press.current.startedAt = time
        press.current.releasedAt = -1
      } else if (!held && press.current.startedAt >= 0) {
        press.current.frozen = time - press.current.startedAt
        press.current.releasedAt = time
        press.current.startedAt = -1
      }

      let collapse = 0
      let fall = 0

      if (press.current.startedAt >= 0) {
        collapse = 1
        fall = time - press.current.startedAt
      } else if (press.current.releasedAt >= 0) {
        const since = (time - press.current.releasedAt) / RETURN_SECONDS
        collapse = 1 - easeOut(since)
        fall = press.current.frozen
        if (collapse <= 0) press.current.releasedAt = -1
      }

      context.viewport(0, 0, Math.round(width * dpr), Math.round(height * dpr))
      context.clearColor(0, 0, 0, 0)
      context.clear(context.COLOR_BUFFER_BIT)
      context.enable(context.BLEND)
      context.blendFunc(context.ONE, context.ONE_MINUS_SRC_ALPHA)

      context.useProgram(program)
      context.bindBuffer(context.ARRAY_BUFFER, buffer)

      const cell = context.getAttribLocation(program, "aCell")
      context.enableVertexAttribArray(cell)
      context.vertexAttribPointer(cell, 2, context.FLOAT, false, 0, 0)

      context.uniform2f(state.uniform("uGrid"), state.columns, state.rows)
      context.uniform2f(state.uniform("uResolution"), width, height)
      context.uniform1f(state.uniform("uDpr"), dpr)
      context.uniform2f(
        state.uniform("uPointer"),
        pointer.current.x,
        pointer.current.y
      )
      context.uniform1f(
        state.uniform("uPointerActive"),
        pointerRadius > 0 ? pointer.current.active : 0
      )
      context.uniform1f(state.uniform("uPointerRadius"), pointerRadius)
      context.uniform1f(state.uniform("uPush"), push)
      context.uniform2f(
        state.uniform("uOrigin"),
        press.current.x,
        press.current.y
      )
      context.uniform1f(state.uniform("uFall"), fall)
      context.uniform1f(state.uniform("uCollapse"), collapse)
      context.uniform1f(state.uniform("uGravity"), gravity)
      context.uniform1f(state.uniform("uScatter"), scatter)
      context.uniform1f(state.uniform("uTime"), time)
      context.uniform1f(state.uniform("uSway"), sway)
      context.uniform1f(state.uniform("uDotSize"), dotSize)

      // The same lattice twice: once under-driven in the second colour, which
      // reads as the grid lagging behind itself, then once in full.
      const trailing = colors.current.echo
      context.uniform1f(state.uniform("uMotion"), 0.55)
      context.uniform1f(state.uniform("uAlpha"), 0.55)
      context.uniform3f(
        state.uniform("uColor"),
        trailing[0],
        trailing[1],
        trailing[2]
      )
      context.drawArrays(context.POINTS, 0, count)

      const front = colors.current.ink
      context.uniform1f(state.uniform("uMotion"), 1)
      context.uniform1f(state.uniform("uAlpha"), 1)
      context.uniform3f(state.uniform("uColor"), front[0], front[1], front[2])
      context.drawArrays(context.POINTS, 0, count)
    },
    [dotSize, gravity, pointerRadius, push, scatter, sway]
  )

  // A resize rebuilds the lattice, so this runs often rather than once.
  const teardown = React.useCallback((state: Lattice) => {
    if (state.program) state.gl.deleteProgram(state.program)
    if (state.buffer) state.gl.deleteBuffer(state.buffer)
    state.program = null
    state.buffer = null
  }, [])

  return (
    <div
      ref={rootRef}
      data-slot="lattice-field"
      className={cn("relative isolate overflow-hidden", className)}
      {...rootProps}
    >
      {ready && (
        <RenderSurface<Lattice, "webgl">
          contextType="webgl"
          setup={setup}
          draw={draw}
          teardown={teardown}
          paused={paused}
          className={cn(
            "pointer-events-none absolute inset-0 -z-10",
            surfaceClassName
          )}
        />
      )}
      {children}
    </div>
  )
}
