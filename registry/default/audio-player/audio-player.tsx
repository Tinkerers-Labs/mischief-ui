"use client"

import * as React from "react"
import { Pause, Play } from "lucide-react"

import {
  RenderSurface,
  useThemeColors,
  type SurfaceColor,
} from "@/registry/default/render-surface/render-surface"
import { cn } from "@/lib/utils"

export type TranscriptLine = {
  /** Seconds from the start of the audio. */
  start: number
  /** Seconds. Only needed when lines do not run back to back. */
  end?: number
  text: string
  speaker?: string
}

export type AudioPlayerProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onError"
> & {
  src: string | Blob
  /** Draw the audio behind the scrubber. */
  waveform?: boolean
  /** Precomputed amplitudes, 0 to 1. Supplying these skips decoding entirely. */
  peaks?: readonly number[]
  transcript?: readonly TranscriptLine[]
  /** Playback rates the button cycles through. */
  rates?: readonly number[]
  /** Above this many bytes the audio plays without a drawn waveform. */
  maxDecodeBytes?: number
  /** A theme token for the played portion. */
  color?: string
  label?: string
}

const BARS = 96

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00"

  const whole = Math.floor(seconds)
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`
}

function peaksOf(buffer: AudioBuffer, bars: number) {
  const channel = buffer.getChannelData(0)
  const per = Math.floor(channel.length / bars) || 1
  const found: number[] = []
  let loudest = 0

  for (let bar = 0; bar < bars; bar += 1) {
    let peak = 0

    for (
      let at = bar * per;
      at < (bar + 1) * per && at < channel.length;
      at++
    ) {
      peak = Math.max(peak, Math.abs(channel[at]!))
    }

    loudest = Math.max(loudest, peak)
    found.push(peak)
  }

  return loudest > 0 ? found.map((peak) => peak / loudest) : found
}

function lineAt(lines: readonly TranscriptLine[], time: number) {
  for (let at = lines.length - 1; at >= 0; at -= 1) {
    const line = lines[at]!
    if (time < line.start) continue
    return line.end !== undefined && time >= line.end ? -1 : at
  }

  return -1
}

/**
 * Plays a recording and shows what is in it: the shape of the audio, where you
 * are inside it, and the words if you have them.
 *
 * The waveform is drawn, so the control that seeks is a real range input laid
 * over it. Dragging a picture is not something a keyboard or a screen reader
 * can do, and the picture is the part that is optional.
 */
export function AudioPlayer({
  src,
  waveform = false,
  peaks,
  transcript,
  rates = [1, 1.5, 2],
  maxDecodeBytes = 40_000_000,
  color = "--primary",
  label = "Recording",
  className,
  ...rootProps
}: AudioPlayerProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const audioRef = React.useRef<HTMLAudioElement>(null)
  const activeRef = React.useRef<HTMLLIElement>(null)

  const [playing, setPlaying] = React.useState(false)
  const [time, setTime] = React.useState(0)
  const [duration, setDuration] = React.useState(0)
  const [rate, setRate] = React.useState(rates[0] ?? 1)
  const [decoded, setDecoded] = React.useState<readonly number[] | null>(null)
  const drawn = peaks ?? decoded

  const tokens = React.useMemo(
    () => (color.startsWith("--") ? [color, "--muted-foreground"] : []),
    [color]
  )
  const resolved = useThemeColors(rootRef, tokens)
  const played = color.startsWith("--") ? resolved[color] : undefined
  const rest = resolved["--muted-foreground"]

  const [reduced, setReduced] = React.useState(false)

  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)")
    const sync = () => setReduced(query.matches)

    sync()
    query.addEventListener("change", sync)
    return () => query.removeEventListener("change", sync)
  }, [])

  const url = React.useMemo(
    () => (typeof src === "string" ? src : URL.createObjectURL(src)),
    [src]
  )

  React.useEffect(() => {
    if (typeof src === "string") return
    return () => URL.revokeObjectURL(url)
  }, [src, url])

  React.useEffect(() => {
    if (peaks || !waveform) return

    let cancelled = false
    const controller = new AbortController()

    const load = async () => {
      const bytes =
        typeof src === "string"
          ? await (
              await fetch(url, { signal: controller.signal })
            ).arrayBuffer()
          : await src.arrayBuffer()

      // Decoding holds the whole file uncompressed. An hour of speech is
      // hundreds of megabytes, so past the ceiling the audio still plays and
      // only the picture is given up.
      if (cancelled || bytes.byteLength > maxDecodeBytes) return

      const context = new AudioContext()
      try {
        const buffer = await context.decodeAudioData(bytes)
        if (!cancelled) setDecoded(peaksOf(buffer, BARS))
      } finally {
        void context.close().catch(() => {})
      }
    }

    void load().catch(() => {})

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [maxDecodeBytes, peaks, src, url, waveform])

  React.useEffect(() => {
    const element = audioRef.current
    if (element) element.playbackRate = rate
  }, [rate])

  const readDuration = React.useCallback(() => {
    const element = audioRef.current
    if (!element) return

    // A file from MediaRecorder carries no duration, and the browser reports
    // Infinity until it has been asked to look. Seeking past the end makes it
    // look, and it reports the real length on the next metadata event.
    if (element.duration === Infinity) {
      element.currentTime = Number.MAX_SAFE_INTEGER
      return
    }

    if (Number.isFinite(element.duration)) {
      setDuration(element.duration)
      if (element.currentTime > element.duration) element.currentTime = 0
    }
  }, [])

  const seek = React.useCallback((to: number) => {
    const element = audioRef.current
    if (!element) return

    element.currentTime = to
    setTime(to)
  }, [])

  const active = transcript ? lineAt(transcript, time) : -1

  React.useEffect(() => {
    if (!playing || active < 0) return

    activeRef.current?.scrollIntoView({
      block: "nearest",
      behavior: reduced ? "auto" : "smooth",
    })
  }, [active, playing, reduced])

  const setup = React.useCallback(() => null, [])

  const draw = React.useCallback(
    ({
      context,
      size: box,
    }: {
      context: CanvasRenderingContext2D
      size: { width: number; height: number; dpr: number }
    }) => {
      if (!played || !rest) return

      context.setTransform(box.dpr, 0, 0, box.dpr, 0, 0)
      context.clearRect(0, 0, box.width, box.height)

      const bars = drawn ?? []
      const count = bars.length || BARS
      const width = box.width / count
      const middle = box.height / 2
      const progress = duration > 0 ? time / duration : 0

      for (let bar = 0; bar < count; bar += 1) {
        // A flat line before the shape is known, rather than an empty box.
        const peak = bars[bar] ?? 0.02
        const height = Math.max(2, peak * box.height * 0.86)
        const [r, g, b] = (
          (bar + 0.5) / count <= progress ? played : rest
        ) as SurfaceColor

        context.fillStyle = `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`
        context.beginPath()
        context.roundRect(
          bar * width + width * 0.2,
          middle - height / 2,
          Math.max(width * 0.6, 1),
          height,
          width * 0.3
        )
        context.fill()
      }
    },
    [drawn, duration, played, rest, time]
  )

  const position = `${formatTime(time)} of ${formatTime(duration)}`

  return (
    <div
      ref={rootRef}
      data-slot="audio-player"
      data-playing={playing ? "" : undefined}
      className={cn(
        "border-border bg-background flex w-full flex-col gap-3 rounded-xl border p-3",
        className
      )}
      {...rootProps}
    >
      <audio
        ref={audioRef}
        src={url}
        preload="metadata"
        onLoadedMetadata={readDuration}
        onDurationChange={readDuration}
        onTimeUpdate={(event) => setTime(event.currentTarget.currentTime)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />

      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={playing ? `Pause ${label}` : `Play ${label}`}
          onClick={() => {
            const element = audioRef.current
            if (!element) return
            if (playing) element.pause()
            else void element.play().catch(() => {})
          }}
          className="bg-foreground text-background focus-visible:ring-ring inline-flex size-10 shrink-0 items-center justify-center rounded-full transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:outline-none motion-reduce:transition-none"
        >
          {playing ? (
            <Pause aria-hidden="true" size={16} />
          ) : (
            <Play aria-hidden="true" size={16} />
          )}
        </button>

        <div className="focus-within:ring-ring relative min-w-0 flex-1 rounded-md focus-within:ring-2">
          {waveform && played !== undefined ? (
            <RenderSurface<null, "2d">
              setup={setup}
              draw={draw}
              paused={!playing}
              revision={`${drawn?.length ?? 0}:${Math.round((duration > 0 ? time / duration : 0) * 400)}`}
              className="pointer-events-none h-12 w-full"
              canvasClassName="h-full w-full"
            />
          ) : (
            <div
              aria-hidden="true"
              className="bg-muted pointer-events-none h-1.5 w-full overflow-hidden rounded-full"
            >
              <div
                className="bg-primary h-full"
                style={{
                  width: `${duration > 0 ? (time / duration) * 100 : 0}%`,
                }}
              />
            </div>
          )}

          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.01}
            value={Math.min(time, duration || 0)}
            disabled={duration === 0}
            aria-label={`Seek ${label}`}
            aria-valuetext={position}
            onChange={(event) => seek(Number(event.target.value))}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-default"
          />
        </div>

        <span
          data-slot="audio-player-time"
          className="text-muted-foreground shrink-0 font-mono text-xs tabular-nums"
        >
          {formatTime(time)}
          <span className="opacity-60"> / {formatTime(duration)}</span>
        </span>

        {rates.length > 1 ? (
          <button
            type="button"
            aria-label={`Playback speed, ${rate} times. Change.`}
            onClick={() =>
              setRate(rates[(rates.indexOf(rate) + 1) % rates.length] ?? 1)
            }
            className="text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-flex h-8 shrink-0 items-center rounded-md px-2 font-mono text-xs tabular-nums transition-colors focus-visible:ring-2 focus-visible:outline-none motion-reduce:transition-none"
          >
            {rate}&times;
          </button>
        ) : null}
      </div>

      {transcript?.length ? (
        <ol
          data-slot="audio-player-transcript"
          className="border-border max-h-56 overflow-y-auto border-t pt-2 text-sm"
        >
          {transcript.map((line, at) => (
            <li
              key={`${line.start}-${at}`}
              ref={at === active ? activeRef : null}
            >
              <button
                type="button"
                aria-current={at === active ? "true" : undefined}
                onClick={() => seek(line.start)}
                className="hover:bg-muted/60 focus-visible:ring-ring aria-[current]:text-foreground text-muted-foreground flex w-full items-baseline gap-3 rounded-md px-2 py-1.5 text-start transition-colors focus-visible:ring-2 focus-visible:outline-none aria-[current]:font-medium motion-reduce:transition-none"
              >
                <span className="shrink-0 font-mono text-xs tabular-nums opacity-70">
                  {formatTime(line.start)}
                </span>
                <span className="min-w-0">
                  {line.speaker ? (
                    <span className="text-foreground me-1.5 font-semibold">
                      {line.speaker}
                    </span>
                  ) : null}
                  {line.text}
                </span>
              </button>
            </li>
          ))}
        </ol>
      ) : null}
    </div>
  )
}
