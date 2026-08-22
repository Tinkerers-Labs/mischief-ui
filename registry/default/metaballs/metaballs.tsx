"use client"

import * as React from "react"
import {
  RenderSurface,
  createQuadProgram,
  useThemeColors,
  type QuadProgram,
  type SurfaceColor,
} from "@/registry/default/render-surface/render-surface"
import { cn } from "@/lib/utils"

const MAX_BALLS = 12

export type MetaballsProps = React.HTMLAttributes<HTMLDivElement> & {
  count?: number
  base?: string
  tint?: string
  speed?: number
  /** Size of each blob, as a fraction of the shorter edge. */
  radius?: number
  /** How sharply the blobs end. Lower is gooier. */
  edge?: number
  paused?: boolean
  surfaceClassName?: string
}

const FRAGMENT = `
precision highp float;
varying vec2 vUv;
uniform vec2 uResolution;
uniform vec3 uBase;
uniform vec3 uTint;
uniform float uRadius;
uniform float uEdge;
uniform int uCount;
uniform vec2 uBalls[${MAX_BALLS}];

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = (vUv - 0.5) * vec2(aspect, 1.0);

  float field = 0.0;
  for (int i = 0; i < ${MAX_BALLS}; i++) {
    if (i >= uCount) break;
    vec2 d = p - uBalls[i];
    field += (uRadius * uRadius) / max(dot(d, d), 0.0001);
  }

  float mask = smoothstep(1.0 - uEdge, 1.0 + uEdge, field);
  gl_FragColor = vec4(mix(uBase, uTint, mask), 1.0);
}
`

type Scene = { quad: QuadProgram | null; balls: Float32Array }

export function Metaballs({
  count = 7,
  base = "--background",
  tint = "--primary",
  speed = 1,
  radius = 0.16,
  edge = 0.35,
  paused,
  className,
  surfaceClassName,
  children,
  ...rootProps
}: MetaballsProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const total = Math.max(1, Math.min(MAX_BALLS, Math.round(count)))

  const tokens = React.useMemo(
    () => [base, tint].filter((entry) => entry.startsWith("--")),
    [base, tint]
  )

  const resolved = useThemeColors(rootRef, tokens)
  const baseColor = base.startsWith("--") ? resolved[base] : undefined
  const tintColor = tint.startsWith("--") ? resolved[tint] : undefined
  const ready = baseColor !== undefined && tintColor !== undefined

  const colorsRef = React.useRef<{ base: SurfaceColor; tint: SurfaceColor }>({
    base: [0, 0, 0],
    tint: [1, 1, 1],
  })

  React.useEffect(() => {
    if (baseColor && tintColor) {
      colorsRef.current = { base: baseColor, tint: tintColor }
    }
  }, [baseColor, tintColor])

  const setup = React.useCallback(
    ({ context }: { context: WebGLRenderingContext }): Scene => ({
      quad: createQuadProgram(context, FRAGMENT),
      balls: new Float32Array(MAX_BALLS * 2),
    }),
    []
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
      state: Scene
      time: number
    }) => {
      const quad = state.quad
      if (!quad) return

      const t = time * speed
      for (let index = 0; index < total; index += 1) {
        const fx = 0.21 + index * 0.037
        const fy = 0.17 + index * 0.043
        state.balls[index * 2] = Math.sin(t * fx * 6.28 + index * 1.7) * 0.34
        state.balls[index * 2 + 1] =
          Math.cos(t * fy * 6.28 + index * 2.3) * 0.28
      }

      const { width, height, dpr } = size
      context.useProgram(quad.program)
      context.uniform2f(quad.uniform("uResolution"), width * dpr, height * dpr)
      context.uniform3fv(quad.uniform("uBase"), colorsRef.current.base)
      context.uniform3fv(quad.uniform("uTint"), colorsRef.current.tint)
      context.uniform1f(quad.uniform("uRadius"), radius)
      context.uniform1f(quad.uniform("uEdge"), edge)
      context.uniform1i(quad.uniform("uCount"), total)
      context.uniform2fv(quad.uniform("uBalls"), state.balls)

      quad.paint(width, height, dpr)
    },
    [edge, radius, speed, total]
  )

  const teardown = React.useCallback((state: Scene) => {
    state.quad?.dispose()
  }, [])

  return (
    <div
      ref={rootRef}
      data-slot="metaballs"
      className={cn(
        "bg-background relative isolate overflow-hidden",
        className
      )}
      {...rootProps}
    >
      {ready && (
        <RenderSurface<Scene, "webgl">
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
