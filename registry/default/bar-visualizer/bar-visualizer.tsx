"use client"

import * as React from "react"

import {
  RenderSurface,
  useThemeColors,
  type SurfaceColor,
} from "@/registry/default/render-surface/render-surface"
import { cn } from "@/lib/utils"

export type BarVisualizerState = "idle" | "listening" | "speaking"

export type BarVisualizerSource =
  MediaStream | HTMLMediaElement | AnalyserNode | null

export type BarVisualizerProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> & {
  /** The audio to draw. Without one the bars rest at their idle height. */
  source?: BarVisualizerSource
  state?: BarVisualizerState
  bars?: number
  /** A theme token for the bars. */
  color?: string
}

const REST = 0.06
const FFT = 256

/**
 * An element can be handed to createMediaElementSource exactly once, and a
 * second call throws for the lifetime of the page. Development remounts every
 * effect twice, so the tap is kept and handed back instead of rebuilt.
 */
const taps = new WeakMap<
  HTMLMediaElement,
  { audio: AudioContext; node: MediaElementAudioSourceNode }
>()

function tap(element: HTMLMediaElement) {
  const found = taps.get(element)
  if (found) return found

  const audio = new AudioContext()
  const built = { audio, node: audio.createMediaElementSource(element) }

  taps.set(element, built)
  return built
}

const wording: Record<BarVisualizerState, string> = {
  idle: "Idle.",
  listening: "Listening.",
  speaking: "Speaking.",
}

/**
 * Frequency bars for audio that is playing or arriving, and the counterpart to
 * the trace a microphone draws while it records.
 *
 * The state is carried in words as well as height, because a reader who has
 * asked for reduced motion is shown a still frame, and a still bar chart says
 * nothing about whether anything is happening.
 */
export function BarVisualizer({
  source = null,
  state = "idle",
  bars = 24,
  color = "--primary",
  className,
  ...rootProps
}: BarVisualizerProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const analyserRef = React.useRef<AnalyserNode | null>(null)
  const samples = React.useRef<Uint8Array<ArrayBuffer> | null>(null)

  const tokens = React.useMemo(
    () => (color.startsWith("--") ? [color] : []),
    [color]
  )
  const resolved = useThemeColors(rootRef, tokens)
  const ink = color.startsWith("--") ? resolved[color] : undefined

  const [reduced, setReduced] = React.useState(false)

  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)")
    const sync = () => setReduced(query.matches)

    sync()
    query.addEventListener("change", sync)
    return () => query.removeEventListener("change", sync)
  }, [])

  React.useEffect(() => {
    if (!source) {
      analyserRef.current = null
      samples.current = null
      return
    }

    if (source instanceof AnalyserNode) {
      analyserRef.current = source
      samples.current = new Uint8Array(source.frequencyBinCount)
      return
    }

    if (source instanceof MediaStream) {
      const audio = new AudioContext()
      const analyser = audio.createAnalyser()
      analyser.fftSize = FFT

      audio.createMediaStreamSource(source).connect(analyser)
      analyserRef.current = analyser
      samples.current = new Uint8Array(analyser.frequencyBinCount)

      return () => {
        analyserRef.current = null
        samples.current = null
        void audio.close().catch(() => {})
      }
    }

    const tapped = tap(source)
    const analyser = tapped.audio.createAnalyser()
    analyser.fftSize = FFT

    // Routing an element through the graph takes it off the speakers, so the
    // analyser has to pass it along to the destination or the audio goes
    // silent.
    tapped.node.disconnect()
    tapped.node.connect(analyser)
    analyser.connect(tapped.audio.destination)

    analyserRef.current = analyser
    samples.current = new Uint8Array(analyser.frequencyBinCount)

    return () => {
      analyserRef.current = null
      samples.current = null
      analyser.disconnect()
      tapped.node.disconnect()
      tapped.node.connect(tapped.audio.destination)
    }
  }, [source])

  const setup = React.useCallback(() => null, [])

  const draw = React.useCallback(
    ({
      context,
      size: box,
    }: {
      context: CanvasRenderingContext2D
      size: { width: number; height: number; dpr: number }
    }) => {
      if (!ink) return

      context.setTransform(box.dpr, 0, 0, box.dpr, 0, 0)
      context.clearRect(0, 0, box.width, box.height)

      const analyser = analyserRef.current
      const data = samples.current

      if (analyser && data) analyser.getByteFrequencyData(data)

      const [r, g, b] = ink as SurfaceColor
      const width = box.width / bars
      const middle = box.height / 2

      context.fillStyle = `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`

      for (let bar = 0; bar < bars; bar += 1) {
        let level = REST

        if (data && data.length > 0 && state !== "idle") {
          // The top of the range is mostly empty for speech, so the bars read
          // the lower half of the spectrum rather than spreading across all
          // of it and leaving the right side flat.
          const from = Math.floor((bar / bars) * (data.length * 0.6))
          const to = Math.floor(((bar + 1) / bars) * (data.length * 0.6))
          let sum = 0

          for (let at = from; at < to; at += 1) sum += data[at]!
          level = Math.max(REST, sum / Math.max(1, to - from) / 255)
        }

        const height = Math.max(2, level * box.height * 0.9)

        context.beginPath()
        context.roundRect(
          bar * width + width * 0.25,
          middle - height / 2,
          Math.max(width * 0.5, 1),
          height,
          width * 0.25
        )
        context.fill()
      }
    },
    [bars, ink, state]
  )

  return (
    <div
      ref={rootRef}
      data-slot="bar-visualizer"
      data-state={state}
      className={cn("flex h-12 w-full items-center", className)}
      {...rootProps}
    >
      {ink !== undefined && !reduced ? (
        <RenderSurface<null, "2d">
          setup={setup}
          draw={draw}
          paused={state === "idle" && !source}
          className="h-full w-full"
          canvasClassName="h-full w-full"
        />
      ) : (
        <div
          aria-hidden="true"
          className="flex h-full w-full items-center gap-1"
        >
          {Array.from({ length: bars }, (_, bar) => (
            <span
              key={bar}
              className="bg-primary h-1 min-w-0 flex-1 rounded-full"
            />
          ))}
        </div>
      )}

      <span aria-live="polite" className="sr-only">
        {wording[state]}
      </span>
    </div>
  )
}
