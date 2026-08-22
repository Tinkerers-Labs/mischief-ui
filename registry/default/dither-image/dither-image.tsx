"use client"

/* eslint-disable @next/next/no-img-element -- This must work outside Next.js. */

import * as React from "react"
import {
  RenderSurface,
  createQuadProgram,
  useThemeColors,
  type QuadProgram,
  type SurfaceColor,
} from "@/registry/default/render-surface/render-surface"
import { cn } from "@/lib/utils"

export type DitherImageProps = React.HTMLAttributes<HTMLDivElement> & {
  src: string
  alt: string
  /** Size of one dot in screen pixels. Larger is coarser and more printed. */
  cell?: number
  /** How many tones survive. Two is a pure halftone. */
  levels?: number
  /** The paper. */
  base?: string
  /** The ink. */
  tint?: string
  contrast?: number
}

const FRAGMENT = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uImage;
uniform vec2 uResolution;
uniform float uCell;
uniform float uLevels;
uniform float uContrast;
uniform float uBoxAspect;
uniform float uImageAspect;
uniform vec3 uBase;
uniform vec3 uTint;

float bayer2(vec2 a) {
  a = floor(a);
  return fract(dot(a, vec2(0.5, a.y * 0.75)));
}

float bayer4(vec2 a) {
  return bayer2(0.5 * a) * 0.25 + bayer2(a);
}

void main() {
  vec2 uv = vec2(vUv.x, 1.0 - vUv.y);

  if (uBoxAspect > uImageAspect) {
    uv.y = (uv.y - 0.5) * (uImageAspect / uBoxAspect) + 0.5;
  } else {
    uv.x = (uv.x - 0.5) * (uBoxAspect / uImageAspect) + 0.5;
  }

  vec2 sampleUv = uv;
  sampleUv = floor(sampleUv * uResolution / uCell) * uCell / uResolution;

  vec3 texel = texture2D(uImage, sampleUv).rgb;
  float luma = dot(texel, vec3(0.2126, 0.7152, 0.0722));
  luma = clamp((luma - 0.5) * uContrast + 0.5, 0.0, 1.0);

  float threshold = bayer4(vUv * uResolution / uCell) * 1.0667;
  float steps = max(uLevels - 1.0, 1.0);
  float value = floor(luma * steps + threshold) / steps;

  // value counts light, so it selects the paper. Mixing the other way round
  // prints the highlights in ink and the shadows in white.
  gl_FragColor = vec4(mix(uTint, uBase, clamp(value, 0.0, 1.0)), 1.0);
}
`

type Scene = {
  quad: QuadProgram | null
  texture: WebGLTexture | null
  aspect: number
  cancelled: boolean
}

/**
 * Reduces a photograph to two theme colours through an ordered dither, the way
 * a newspaper reduced one to ink and paper. The original is kept underneath as
 * ordinary markup, so nothing that cannot run the shader is left with a gap.
 */
export function DitherImage({
  src,
  alt,
  cell = 4,
  levels = 2,
  base = "--background",
  tint = "--foreground",
  contrast = 1.15,
  className,
  children,
  ...rootProps
}: DitherImageProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const [arrived, setArrived] = React.useState(0)

  const tokens = React.useMemo(
    () => [base, tint].filter((entry) => entry.startsWith("--")),
    [base, tint]
  )

  const resolved = useThemeColors(rootRef, tokens)
  const baseColor = base.startsWith("--") ? resolved[base] : undefined
  const tintColor = tint.startsWith("--") ? resolved[tint] : undefined
  const ready = baseColor !== undefined && tintColor !== undefined

  const colorsRef = React.useRef<{ base: SurfaceColor; tint: SurfaceColor }>({
    base: [1, 1, 1],
    tint: [0, 0, 0],
  })

  React.useEffect(() => {
    if (baseColor && tintColor) {
      colorsRef.current = { base: baseColor, tint: tintColor }
    }
  }, [baseColor, tintColor])

  const setup = React.useCallback(
    ({ context }: { context: WebGLRenderingContext }): Scene => {
      const scene: Scene = {
        quad: createQuadProgram(context, FRAGMENT),
        texture: context.createTexture(),
        aspect: 1,
        cancelled: false,
      }

      context.bindTexture(context.TEXTURE_2D, scene.texture)
      context.texImage2D(
        context.TEXTURE_2D,
        0,
        context.RGBA,
        1,
        1,
        0,
        context.RGBA,
        context.UNSIGNED_BYTE,
        new Uint8Array([0, 0, 0, 0])
      )

      const image = new Image()
      image.crossOrigin = "anonymous"
      image.decoding = "async"

      image.onload = () => {
        if (scene.cancelled || !scene.texture) return

        setArrived((count) => count + 1)
        scene.aspect = image.naturalWidth / Math.max(image.naturalHeight, 1)
        context.bindTexture(context.TEXTURE_2D, scene.texture)
        context.texImage2D(
          context.TEXTURE_2D,
          0,
          context.RGBA,
          context.RGBA,
          context.UNSIGNED_BYTE,
          image
        )
        context.texParameteri(
          context.TEXTURE_2D,
          context.TEXTURE_WRAP_S,
          context.CLAMP_TO_EDGE
        )
        context.texParameteri(
          context.TEXTURE_2D,
          context.TEXTURE_WRAP_T,
          context.CLAMP_TO_EDGE
        )
        context.texParameteri(
          context.TEXTURE_2D,
          context.TEXTURE_MIN_FILTER,
          context.LINEAR
        )
        context.texParameteri(
          context.TEXTURE_2D,
          context.TEXTURE_MAG_FILTER,
          context.LINEAR
        )
      }

      image.src = src

      return scene
    },
    [src]
  )

  const draw = React.useCallback(
    ({
      context,
      size,
      state,
    }: {
      context: WebGLRenderingContext
      size: { width: number; height: number; dpr: number }
      state: Scene
    }) => {
      const quad = state.quad
      if (!quad) return

      const { width, height, dpr } = size
      context.useProgram(quad.program)
      context.activeTexture(context.TEXTURE0)
      context.bindTexture(context.TEXTURE_2D, state.texture)
      context.uniform1i(quad.uniform("uImage"), 0)
      context.uniform2f(quad.uniform("uResolution"), width * dpr, height * dpr)
      context.uniform1f(quad.uniform("uCell"), Math.max(cell, 1) * dpr)
      context.uniform1f(quad.uniform("uLevels"), Math.max(levels, 2))
      context.uniform1f(quad.uniform("uContrast"), contrast)
      context.uniform1f(quad.uniform("uBoxAspect"), width / Math.max(height, 1))
      context.uniform1f(quad.uniform("uImageAspect"), state.aspect)
      context.uniform3fv(quad.uniform("uBase"), colorsRef.current.base)
      context.uniform3fv(quad.uniform("uTint"), colorsRef.current.tint)

      quad.paint(width, height, dpr)
    },
    [cell, contrast, levels]
  )

  const teardown = React.useCallback((state: Scene) => {
    state.cancelled = true
    state.quad?.dispose()
  }, [])

  return (
    <div
      ref={rootRef}
      data-slot="dither-image"
      className={cn(
        "bg-muted relative isolate overflow-hidden rounded-[var(--radius)]",
        className
      )}
      {...rootProps}
    >
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 size-full object-cover"
      />

      {ready && (
        <RenderSurface<Scene, "webgl">
          contextType="webgl"
          setup={setup}
          draw={draw}
          teardown={teardown}
          revision={arrived}
          label={alt}
          className="absolute inset-0"
        />
      )}

      {children !== undefined && <div className="relative">{children}</div>}
    </div>
  )
}
