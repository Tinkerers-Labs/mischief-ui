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

export type ShaderSurfaceVariant = "caustics" | "metal" | "plasma" | "ripple"

export type ShaderSurfaceProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: ShaderSurfaceVariant
  /** The colour the surface settles to. A theme property or a CSS colour. */
  base?: string
  /** The colour the light in it takes. */
  tint?: string
  speed?: number
  /** Size of the pattern. Larger is busier. */
  scale?: number
  paused?: boolean
  surfaceClassName?: string
}

const PRELUDE = `
precision highp float;
varying vec2 vUv;
uniform vec2 uResolution;
uniform float uTime;
uniform float uScale;
uniform vec3 uBase;
uniform vec3 uTint;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 5; i++) {
    value += amplitude * noise(p);
    p *= 2.03;
    amplitude *= 0.5;
  }
  return value;
}

vec2 aspectUv() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  return (vUv - 0.5) * vec2(aspect, 1.0);
}
`

const BODIES: Record<ShaderSurfaceVariant, string> = {
  caustics: `
vec3 shade() {
  vec2 p = aspectUv() * uScale;
  float t = uTime * 0.35;
  vec2 q = vec2(fbm(p + t), fbm(p + vec2(5.2, 1.3) - t));
  float f = fbm(p + 4.0 * q);
  float light = pow(abs(sin(f * 6.2831 + t * 2.0)), 3.0);
  return mix(uBase, uTint, light);
}
`,
  metal: `
vec3 shade() {
  vec2 p = aspectUv() * uScale;
  float f = fbm(p * 1.2 + vec2(uTime * 0.15, uTime * 0.05));
  float bands = sin((p.x * 1.4 + f * 3.4) * 6.2831);
  float shine = pow(abs(bands), 8.0);
  vec3 body = mix(uBase, uTint, 0.3 + 0.45 * f);
  return body + shine * 0.55;
}
`,
  plasma: `
vec3 shade() {
  vec2 p = aspectUv() * uScale;
  vec2 drift = vec2(sin(uTime * 0.2), cos(uTime * 0.17)) * 1.5;
  float f = fbm(p + drift);
  return mix(uBase, uTint, smoothstep(0.25, 0.75, f));
}
`,
  ripple: `
vec3 shade() {
  vec2 p = aspectUv();
  float d = length(p);
  float wave = sin(d * uScale * 4.0 - uTime * 2.0) * 0.5 + 0.5;
  float fade = smoothstep(1.0, 0.0, d);
  return mix(uBase, uTint, wave * fade);
}
`,
}

const MAIN = `
void main() {
  gl_FragColor = vec4(clamp(shade(), 0.0, 1.0), 1.0);
}
`

type Scene = { program: QuadProgram | null }

/**
 * A shader-drawn background. Every variant reads its two colours from the
 * theme, so the same surface arrives dark in a dark application and light in a
 * light one without being told which it is in.
 */
export function ShaderSurface({
  variant = "plasma",
  base = "--background",
  tint = "--primary",
  speed = 1,
  scale = 3,
  paused,
  className,
  surfaceClassName,
  children,
  ...rootProps
}: ShaderSurfaceProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)

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
    ({ context }: { context: WebGLRenderingContext }) => ({
      program: createQuadProgram(context, PRELUDE + BODIES[variant] + MAIN),
    }),
    [variant]
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
      const quad = state.program
      if (!quad) return

      const { width, height, dpr } = size
      context.useProgram(quad.program)
      context.uniform2f(quad.uniform("uResolution"), width * dpr, height * dpr)
      context.uniform1f(quad.uniform("uTime"), time * speed)
      context.uniform1f(quad.uniform("uScale"), scale)
      context.uniform3fv(quad.uniform("uBase"), colorsRef.current.base)
      context.uniform3fv(quad.uniform("uTint"), colorsRef.current.tint)

      quad.paint(width, height, dpr)
    },
    [scale, speed]
  )

  const teardown = React.useCallback((state: Scene) => {
    state.program?.dispose()
  }, [])

  return (
    <div
      ref={rootRef}
      data-slot="shader-surface"
      data-variant={variant}
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
