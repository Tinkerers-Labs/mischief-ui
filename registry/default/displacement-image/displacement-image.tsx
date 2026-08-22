"use client"

/* eslint-disable @next/next/no-img-element -- This must work outside Next.js. */

import * as React from "react"
import {
  RenderSurface,
  createQuadProgram,
  type QuadProgram,
} from "@/registry/default/render-surface/render-surface"
import { cn } from "@/lib/utils"

export type DisplacementImageProps = React.HTMLAttributes<HTMLDivElement> & {
  from: string
  to: string
  alt: string
  /** How far the pixels are pushed during the crossing, as a fraction of the box. */
  intensity?: number
  /** Seconds the crossing takes. */
  duration?: number
  /** Drives the crossing yourself instead of on pointer and focus. */
  active?: boolean
}

const FRAGMENT = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uFrom;
uniform sampler2D uTo;
uniform float uProgress;
uniform float uIntensity;
uniform float uBoxAspect;
uniform float uFromAspect;
uniform float uToAspect;

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
    p *= 2.05;
    amplitude *= 0.5;
  }
  return value;
}

vec2 cover(vec2 uv, float imageAspect) {
  if (uBoxAspect > imageAspect) {
    uv.y = (uv.y - 0.5) * (imageAspect / uBoxAspect) + 0.5;
  } else {
    uv.x = (uv.x - 0.5) * (uBoxAspect / imageAspect) + 0.5;
  }
  return uv;
}

void main() {
  vec2 uv = vec2(vUv.x, 1.0 - vUv.y);
  float n = fbm(uv * 3.0);
  vec2 push = vec2(n - 0.5, fbm(uv * 3.0 + 7.3) - 0.5) * uIntensity;
  float p = smoothstep(0.0, 1.0, uProgress);

  vec4 a = texture2D(uFrom, cover(uv + push * p, uFromAspect));
  vec4 b = texture2D(uTo, cover(uv - push * (1.0 - p), uToAspect));

  gl_FragColor = mix(a, b, p);
}
`

type Slot = { texture: WebGLTexture | null; aspect: number }

type Scene = {
  quad: QuadProgram | null
  from: Slot
  to: Slot
  progress: number
  cancelled: boolean
}

function loadInto(
  gl: WebGLRenderingContext,
  slot: Slot,
  src: string,
  scene: Scene
) {
  const texture = gl.createTexture()
  slot.texture = texture

  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    1,
    1,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    new Uint8Array([0, 0, 0, 0])
  )

  const image = new Image()
  image.crossOrigin = "anonymous"
  image.decoding = "async"

  image.onload = () => {
    if (scene.cancelled || !slot.texture) return

    slot.aspect = image.naturalWidth / Math.max(image.naturalHeight, 1)
    gl.bindTexture(gl.TEXTURE_2D, slot.texture)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  }

  image.src = src
}

/**
 * Crosses between two images by pushing their pixels through the same noise in
 * opposite directions. The first image is also rendered as ordinary markup
 * underneath, so a reader whose browser refuses WebGL still sees a picture.
 */
export function DisplacementImage({
  from,
  to,
  alt,
  intensity = 0.35,
  duration = 0.7,
  active,
  className,
  children,
  ...rootProps
}: DisplacementImageProps) {
  const [hovered, setHovered] = React.useState(false)
  const target = active ?? hovered
  const targetRef = React.useRef(target)

  React.useEffect(() => {
    targetRef.current = target
  }, [target])

  const setup = React.useCallback(
    ({ context }: { context: WebGLRenderingContext }) => {
      const scene: Scene = {
        quad: createQuadProgram(context, FRAGMENT),
        from: { texture: null, aspect: 1 },
        to: { texture: null, aspect: 1 },
        progress: targetRef.current ? 1 : 0,
        cancelled: false,
      }

      loadInto(context, scene.from, from, scene)
      loadInto(context, scene.to, to, scene)

      return scene
    },
    [from, to]
  )

  const draw = React.useCallback(
    ({
      context,
      size,
      state,
      delta,
    }: {
      context: WebGLRenderingContext
      size: { width: number; height: number; dpr: number }
      state: Scene
      delta: number
    }) => {
      const quad = state.quad
      if (!quad) return

      const goal = targetRef.current ? 1 : 0
      const step = duration > 0 ? delta / duration : 1
      state.progress +=
        Math.sign(goal - state.progress) *
        Math.min(Math.abs(goal - state.progress), step)

      const { width, height, dpr } = size
      context.useProgram(quad.program)

      context.activeTexture(context.TEXTURE0)
      context.bindTexture(context.TEXTURE_2D, state.from.texture)
      context.uniform1i(quad.uniform("uFrom"), 0)

      context.activeTexture(context.TEXTURE1)
      context.bindTexture(context.TEXTURE_2D, state.to.texture)
      context.uniform1i(quad.uniform("uTo"), 1)

      context.uniform1f(quad.uniform("uProgress"), state.progress)
      context.uniform1f(quad.uniform("uIntensity"), intensity)
      context.uniform1f(quad.uniform("uBoxAspect"), width / Math.max(height, 1))
      context.uniform1f(quad.uniform("uFromAspect"), state.from.aspect)
      context.uniform1f(quad.uniform("uToAspect"), state.to.aspect)

      quad.paint(width, height, dpr)
    },
    [duration, intensity]
  )

  const teardown = React.useCallback((state: Scene) => {
    state.cancelled = true
    state.quad?.dispose()
  }, [])

  return (
    <div
      data-slot="displacement-image"
      data-active={target ? "" : undefined}
      className={cn(
        "bg-muted relative isolate overflow-hidden rounded-[var(--radius)]",
        className
      )}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocusCapture={() => setHovered(true)}
      onBlurCapture={() => setHovered(false)}
      {...rootProps}
    >
      <img
        src={from}
        alt={alt}
        className="absolute inset-0 size-full object-cover"
      />

      <RenderSurface<Scene, "webgl">
        contextType="webgl"
        setup={setup}
        draw={draw}
        teardown={teardown}
        label={alt}
        className="absolute inset-0"
      />

      {children !== undefined && <div className="relative">{children}</div>}
    </div>
  )
}
