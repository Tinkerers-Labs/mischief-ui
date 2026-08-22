"use client"

import * as React from "react"
import {
  RenderSurface,
  useThemeColors,
  type SurfaceColor,
} from "@/registry/default/render-surface/render-surface"
import { cn } from "@/lib/utils"

export type AsciiImageProps = React.HTMLAttributes<HTMLDivElement> & {
  src: string
  alt: string
  /** Width of one character cell in pixels. Smaller is more detailed. */
  cell?: number
  /** Darkest character first. */
  ramp?: string
  color?: string
  background?: string
  contrast?: number
}

const DEFAULT_RAMP = "@%#*+=-:. "

type Scene = {
  grid: HTMLCanvasElement
  sampler: HTMLCanvasElement
  drawn: string | null
}

function rgb([r, g, b]: SurfaceColor) {
  return `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`
}

/**
 * Redraws a photograph as characters. The grid is worked out once and kept,
 * and each frame is a single copy of it, so nothing here recomputes thousands
 * of letters sixty times a second.
 */
export function AsciiImage({
  src,
  alt,
  cell = 8,
  ramp = DEFAULT_RAMP,
  color = "--foreground",
  background = "--background",
  contrast = 1.2,
  className,
  children,
  ...rootProps
}: AsciiImageProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const picture = React.useRef<HTMLImageElement | null>(null)
  const [ready, setReady] = React.useState<string | null>(null)

  // Loading lives here rather than in setup, because setup runs again for
  // reasons that have nothing to do with the picture.
  React.useEffect(() => {
    const image = new Image()
    let cancelled = false

    image.crossOrigin = "anonymous"
    image.decoding = "async"
    image.onload = () => {
      if (cancelled) return
      picture.current = image
      setReady(src)
    }
    image.src = src

    return () => {
      cancelled = true
    }
  }, [src])

  const tokens = React.useMemo(
    () => [color, background].filter((entry) => entry.startsWith("--")),
    [background, color]
  )

  const resolved = useThemeColors(rootRef, tokens)
  const ink = color.startsWith("--") ? resolved[color] : undefined
  const paper = background.startsWith("--") ? resolved[background] : undefined
  const themed = ink !== undefined && paper !== undefined

  const recipe = `${ready}|${cell}|${ramp}|${contrast}|${ink?.join()}|${paper?.join()}`

  const setup = React.useCallback(
    (): Scene => ({
      grid: document.createElement("canvas"),
      sampler: document.createElement("canvas"),
      drawn: null,
    }),
    []
  )

  const draw = React.useCallback(
    ({
      canvas,
      context,
      size,
      state,
    }: {
      canvas: HTMLCanvasElement
      context: CanvasRenderingContext2D
      size: { width: number; height: number; dpr: number }
      state: Scene
    }) => {
      if (!ink || !paper) return

      const { width, height, dpr } = size
      const wanted = `${recipe}|${Math.round(width)}x${Math.round(height)}|${dpr}`

      if (state.drawn !== wanted) {
        const image = picture.current
        state.grid.width = canvas.width
        state.grid.height = canvas.height

        const grid = state.grid.getContext("2d")
        if (!grid) return

        grid.setTransform(dpr, 0, 0, dpr, 0, 0)
        grid.fillStyle = rgb(paper)
        grid.fillRect(0, 0, width, height)

        if (image) {
          const cellWidth = Math.max(cell, 2)
          const cellHeight = cellWidth * 1.6
          const columns = Math.max(1, Math.floor(width / cellWidth))
          const rows = Math.max(1, Math.floor(height / cellHeight))

          state.sampler.width = columns
          state.sampler.height = rows

          const sampling = state.sampler.getContext("2d", {
            willReadFrequently: true,
          })

          if (!sampling) return

          // Cover, so the picture keeps its shape in whatever box it was given.
          const boxAspect = columns / rows
          const imageAspect =
            image.naturalWidth / Math.max(image.naturalHeight, 1)
          const scaled =
            boxAspect > imageAspect
              ? { w: columns, h: columns / imageAspect }
              : { w: rows * imageAspect, h: rows }

          sampling.drawImage(
            image,
            (columns - scaled.w) / 2,
            (rows - scaled.h) / 2,
            scaled.w,
            scaled.h
          )

          const data = sampling.getImageData(0, 0, columns, rows).data

          // A canvas font string cannot hold a custom property, so the stack
          // is read off the canvas, which carries the monospace class.
          const family =
            getComputedStyle(canvas).fontFamily || "ui-monospace, monospace"

          grid.fillStyle = rgb(ink)
          grid.font = `${cellHeight * 0.92}px ${family}`
          grid.textBaseline = "top"

          for (let row = 0; row < rows; row += 1) {
            for (let column = 0; column < columns; column += 1) {
              const index = (row * columns + column) * 4
              const luma =
                ((data[index] ?? 0) * 0.2126 +
                  (data[index + 1] ?? 0) * 0.7152 +
                  (data[index + 2] ?? 0) * 0.0722) /
                255

              const adjusted = Math.min(
                1,
                Math.max(0, (luma - 0.5) * contrast + 0.5)
              )

              const character =
                ramp[
                  Math.min(ramp.length - 1, Math.floor(adjusted * ramp.length))
                ]

              if (character && character !== " ") {
                grid.fillText(character, column * cellWidth, row * cellHeight)
              }
            }
          }

          state.drawn = wanted
        }
      }

      context.setTransform(1, 0, 0, 1, 0, 0)
      context.clearRect(0, 0, canvas.width, canvas.height)
      context.drawImage(state.grid, 0, 0)
    },
    [cell, contrast, ink, paper, ramp, recipe]
  )

  return (
    <div
      ref={rootRef}
      data-slot="ascii-image"
      className={cn(
        "bg-background relative isolate overflow-hidden rounded-[var(--radius)]",
        className
      )}
      {...rootProps}
    >
      {themed && (
        <RenderSurface<Scene, "2d">
          setup={setup}
          draw={draw}
          rebuildOnResize={false}
          revision={recipe}
          label={alt}
          className="absolute inset-0"
          canvasClassName="font-mono"
        />
      )}
      {children !== undefined && <div className="relative">{children}</div>}
    </div>
  )
}
