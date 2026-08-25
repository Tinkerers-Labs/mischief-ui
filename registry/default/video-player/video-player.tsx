"use client"

import * as React from "react"
import {
  Captions,
  CaptionsOff,
  Maximize,
  Minimize,
  Pause,
  Play,
  Volume2,
  VolumeX,
} from "lucide-react"

import { cn } from "@/lib/utils"

export type VideoTrack = {
  src: string
  /** A BCP 47 language tag, such as "en". */
  srcLang: string
  label: string
  kind?: "subtitles" | "captions"
  default?: boolean
}

export type VideoPlayerProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onError" | "children"
> & {
  src: string
  /** Names the video for assistive technology. */
  label: string
  poster?: string
  tracks?: readonly VideoTrack[]
  rates?: readonly number[]
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00"

  const whole = Math.floor(seconds)
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`
}

/**
 * Video with controls of its own, captions that can be turned on, and a
 * scrubber that is a real range input rather than a bar to be dragged.
 */
export function VideoPlayer({
  src,
  label,
  poster,
  tracks = [],
  rates = [1, 1.5, 2],
  className,
  ...rootProps
}: VideoPlayerProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const videoRef = React.useRef<HTMLVideoElement>(null)

  const [playing, setPlaying] = React.useState(false)
  const [time, setTime] = React.useState(0)
  const [duration, setDuration] = React.useState(0)
  const [muted, setMuted] = React.useState(false)
  const [rate, setRate] = React.useState(rates[0] ?? 1)
  const [captions, setCaptions] = React.useState(
    tracks.some((track) => track.default)
  )
  const [full, setFull] = React.useState(false)
  const touched = React.useRef(false)

  const wanted = tracks.some((track) => track.default)

  // Tracks often arrive after the video does. Following the default until
  // someone works the toggle keeps a late arrival from being ignored, and a
  // deliberate choice from being overruled.
  React.useEffect(() => {
    if (!touched.current) setCaptions(wanted)
  }, [wanted])

  React.useEffect(() => {
    const element = videoRef.current
    if (element) element.playbackRate = rate
  }, [rate])

  // Custom controls mean the browser's caption menu is gone, so the track mode
  // is set by hand. The cues are still drawn by the browser once it is showing.
  React.useEffect(() => {
    const element = videoRef.current
    if (!element) return

    for (const track of Array.from(element.textTracks)) {
      if (track.kind === "subtitles" || track.kind === "captions") {
        track.mode = captions ? "showing" : "hidden"
      }
    }
  }, [captions, tracks])

  React.useEffect(() => {
    const sync = () => setFull(document.fullscreenElement === rootRef.current)

    document.addEventListener("fullscreenchange", sync)
    return () => document.removeEventListener("fullscreenchange", sync)
  }, [])

  const seek = (to: number) => {
    const element = videoRef.current
    if (!element) return

    element.currentTime = to
    setTime(to)
  }

  const position = `${formatTime(time)} of ${formatTime(duration)}`

  return (
    <div
      ref={rootRef}
      data-slot="video-player"
      data-playing={playing ? "" : undefined}
      className={cn(
        "border-border bg-background overflow-hidden rounded-xl border",
        className
      )}
      {...rootProps}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        preload="metadata"
        playsInline
        aria-label={label}
        onLoadedMetadata={(event) =>
          setDuration(event.currentTarget.duration || 0)
        }
        onTimeUpdate={(event) => setTime(event.currentTarget.currentTime)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onClick={() => {
          const element = videoRef.current
          if (!element) return
          if (playing) element.pause()
          else void element.play().catch(() => {})
        }}
        className="block w-full cursor-pointer bg-black"
      >
        {tracks.map((track) => (
          <track
            key={track.src}
            src={track.src}
            kind={track.kind ?? "captions"}
            srcLang={track.srcLang}
            label={track.label}
            default={track.default}
          />
        ))}
      </video>

      <div className="flex items-center gap-2 p-2">
        <button
          type="button"
          aria-label={playing ? `Pause ${label}` : `Play ${label}`}
          onClick={() => {
            const element = videoRef.current
            if (!element) return
            if (playing) element.pause()
            else void element.play().catch(() => {})
          }}
          className="bg-foreground text-background focus-visible:ring-ring inline-flex size-9 shrink-0 items-center justify-center rounded-full transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:outline-none motion-reduce:transition-none"
        >
          {playing ? (
            <Pause aria-hidden="true" size={15} />
          ) : (
            <Play aria-hidden="true" size={15} />
          )}
        </button>

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
          className="accent-primary focus-visible:ring-ring min-w-0 flex-1 cursor-pointer rounded-full focus-visible:ring-2 focus-visible:outline-none disabled:cursor-default"
        />

        <span
          data-slot="video-player-time"
          className="text-muted-foreground shrink-0 font-mono text-xs tabular-nums"
        >
          {formatTime(time)}
          <span className="opacity-60"> / {formatTime(duration)}</span>
        </span>

        <button
          type="button"
          aria-label={muted ? `Unmute ${label}` : `Mute ${label}`}
          aria-pressed={muted}
          onClick={() => {
            const element = videoRef.current
            if (!element) return
            element.muted = !muted
            setMuted(!muted)
          }}
          className="text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-flex size-8 shrink-0 items-center justify-center rounded-md transition-colors focus-visible:ring-2 focus-visible:outline-none motion-reduce:transition-none"
        >
          {muted ? (
            <VolumeX aria-hidden="true" size={15} />
          ) : (
            <Volume2 aria-hidden="true" size={15} />
          )}
        </button>

        {tracks.length > 0 ? (
          <button
            type="button"
            aria-label={captions ? "Turn captions off" : "Turn captions on"}
            aria-pressed={captions}
            onClick={() => {
              touched.current = true
              setCaptions((on) => !on)
            }}
            className="text-muted-foreground aria-pressed:text-foreground hover:text-foreground focus-visible:ring-ring inline-flex size-8 shrink-0 items-center justify-center rounded-md transition-colors focus-visible:ring-2 focus-visible:outline-none motion-reduce:transition-none"
          >
            {captions ? (
              <Captions aria-hidden="true" size={15} />
            ) : (
              <CaptionsOff aria-hidden="true" size={15} />
            )}
          </button>
        ) : null}

        {rates.length > 1 ? (
          <button
            type="button"
            aria-label={`Playback speed, ${rate} times. Change.`}
            onClick={() =>
              setRate(rates[(rates.indexOf(rate) + 1) % rates.length] ?? 1)
            }
            className="text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-flex h-8 shrink-0 items-center rounded-md px-1.5 font-mono text-xs tabular-nums transition-colors focus-visible:ring-2 focus-visible:outline-none motion-reduce:transition-none"
          >
            {rate}&times;
          </button>
        ) : null}

        <button
          type="button"
          aria-label={full ? "Leave full screen" : "Go full screen"}
          aria-pressed={full}
          onClick={() => {
            if (document.fullscreenElement) void document.exitFullscreen()
            else void rootRef.current?.requestFullscreen().catch(() => {})
          }}
          className="text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-flex size-8 shrink-0 items-center justify-center rounded-md transition-colors focus-visible:ring-2 focus-visible:outline-none motion-reduce:transition-none"
        >
          {full ? (
            <Minimize aria-hidden="true" size={15} />
          ) : (
            <Maximize aria-hidden="true" size={15} />
          )}
        </button>
      </div>
    </div>
  )
}
