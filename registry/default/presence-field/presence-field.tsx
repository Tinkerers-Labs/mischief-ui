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

export type AgentPresence = "idle" | "thinking" | "streaming" | "done" | "error"

export type PresenceFieldProps = React.HTMLAttributes<HTMLDivElement> & {
  state?: AgentPresence
  /** Colour the field settles to. */
  base?: string
  /** Colour it takes while it is working. */
  active?: string
  /** Colour it takes when something went wrong. */
  fault?: string
  /** Colour it rests in. */
  quiet?: string
  /** Nought to one, for how much is arriving. Only read while streaming. */
  activity?: number
  surfaceClassName?: string
}

type Mood = {
  speed: number
  strength: number
  token: "active" | "fault" | "quiet"
}

const MOODS: Record<AgentPresence, Mood> = {
  idle: { speed: 0.18, strength: 0.22, token: "quiet" },
  thinking: { speed: 1, strength: 0.72, token: "active" },
  streaming: { speed: 1.5, strength: 0.9, token: "active" },
  done: { speed: 0.12, strength: 0.34, token: "active" },
  error: { speed: 0.45, strength: 0.6, token: "fault" },
}

const FRAGMENT = `
precision highp float;
varying vec2 vUv;
uniform vec2 uResolution;
uniform float uTime;
uniform float uStrength;
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
  for (int i = 0; i < 4; i++) {
    value += amplitude * noise(p);
    p *= 2.02;
    amplitude *= 0.5;
  }
  return value;
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = (vUv - 0.5) * vec2(aspect, 1.0) * 2.6;

  vec2 drift = vec2(sin(uTime * 0.21), cos(uTime * 0.18));
  float f = fbm(p + drift);

  // Brightest at the edges, so the middle stays quiet enough to read on.
  float rim = smoothstep(0.15, 0.85, length((vUv - 0.5) * vec2(aspect, 1.0)));
  float amount = smoothstep(0.3, 0.8, f) * uStrength * (0.35 + rim);

  gl_FragColor = vec4(mix(uBase, uTint, clamp(amount, 0.0, 1.0)), 1.0);
}
`

type Scene = { quad: QuadProgram | null; speed: number; strength: number }

/**
 * An ambient backdrop that carries what the assistant is doing. It is a second
 * channel for something already said in words: put it behind a thread whose
 * thinking state is written out, never in place of one.
 */
export function PresenceField({
  state = "idle",
  base = "--background",
  active = "--primary",
  fault = "--destructive",
  quiet = "--muted-foreground",
  activity = 0.5,
  className,
  surfaceClassName,
  children,
  ...rootProps
}: PresenceFieldProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const mood = MOODS[state]

  const tokens = React.useMemo(
    () =>
      [base, active, fault, quiet].filter((entry) => entry.startsWith("--")),
    [active, base, fault, quiet]
  )

  const resolved = useThemeColors(rootRef, tokens)
  const pick = { active, fault, quiet }[mood.token]
  const baseColor = base.startsWith("--") ? resolved[base] : undefined
  const tintColor = pick.startsWith("--") ? resolved[pick] : undefined
  const ready = baseColor !== undefined && tintColor !== undefined

  const target = React.useRef({
    base: [0, 0, 0] as SurfaceColor,
    tint: [1, 1, 1] as SurfaceColor,
    speed: mood.speed,
    strength: mood.strength,
  })

  React.useEffect(() => {
    const boost = state === "streaming" ? 0.6 + activity * 0.8 : 1

    target.current = {
      base: baseColor ?? target.current.base,
      tint: tintColor ?? target.current.tint,
      speed: mood.speed * boost,
      strength: mood.strength,
    }
  }, [activity, baseColor, mood.speed, mood.strength, state, tintColor])

  // Typed arrays so the easing indexes a number rather than a maybe, and so
  // the uniforms are uploaded without allocating on every frame.
  const current = React.useRef({
    base: new Float32Array([0, 0, 0]),
    tint: new Float32Array([1, 1, 1]),
    started: false,
  })

  const setup = React.useCallback(
    ({ context }: { context: WebGLRenderingContext }): Scene => ({
      quad: createQuadProgram(context, FRAGMENT),
      speed: target.current.speed,
      strength: target.current.strength,
    }),
    []
  )

  const draw = React.useCallback(
    ({
      context,
      size,
      state: scene,
      time,
      delta,
    }: {
      context: WebGLRenderingContext
      size: { width: number; height: number; dpr: number }
      state: Scene
      time: number
      delta: number
    }) => {
      const quad = scene.quad
      if (!quad) return

      // The mood arrives rather than switching, so a thread that finishes
      // settles instead of snapping to a new colour.
      const rate = Math.min(1, delta * 2.2)
      const goal = target.current

      const held = current.current

      if (!held.started) {
        held.base.set(goal.base)
        held.tint.set(goal.tint)
        held.started = true
      }

      for (let channel = 0; channel < 3; channel += 1) {
        const currentBase = held.base[channel] ?? 0
        const currentTint = held.tint[channel] ?? 0

        held.base[channel] =
          currentBase + ((goal.base[channel] ?? 0) - currentBase) * rate
        held.tint[channel] =
          currentTint + ((goal.tint[channel] ?? 0) - currentTint) * rate
      }

      scene.speed += (goal.speed - scene.speed) * rate
      scene.strength += (goal.strength - scene.strength) * rate

      const { width, height, dpr } = size
      context.useProgram(quad.program)
      context.uniform2f(quad.uniform("uResolution"), width * dpr, height * dpr)
      context.uniform1f(quad.uniform("uTime"), time * scene.speed)
      context.uniform1f(quad.uniform("uStrength"), scene.strength)
      context.uniform3fv(quad.uniform("uBase"), held.base)
      context.uniform3fv(quad.uniform("uTint"), held.tint)

      quad.paint(width, height, dpr)
    },
    []
  )

  const teardown = React.useCallback((scene: Scene) => {
    scene.quad?.dispose()
  }, [])

  return (
    <div
      ref={rootRef}
      data-slot="presence-field"
      data-state={state}
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
