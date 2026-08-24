"use client"

import * as React from "react"
import { Mic, MicOff, Square } from "lucide-react"

import {
  RenderSurface,
  useThemeColors,
  type SurfaceColor,
} from "@/registry/default/render-surface/render-surface"
import { cn } from "@/lib/utils"

export type VoiceInputStatus =
  "unsupported" | "idle" | "requesting" | "listening" | "denied" | "error"

export type VoiceInputProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onError"
> & {
  /** The recording, once it has stopped. Send it wherever it gets read. */
  onResult?: (recording: Blob) => void
  onStart?: () => void
  onStop?: () => void
  onStatusChange?: (status: VoiceInputStatus) => void
  /** Seconds after which it stops on its own. Off by default. */
  maxDuration?: number
  /** A theme token for the trace. */
  color?: string
  /** Preferred container. The browser decides if it cannot honour this. */
  mimeType?: string
  label?: string
  disabled?: boolean
}

const noop = () => () => {}

function canRecord() {
  return (
    Boolean(navigator.mediaDevices?.getUserMedia) &&
    typeof MediaRecorder !== "undefined"
  )
}

function formatElapsed(seconds: number) {
  const whole = Math.floor(seconds)
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`
}

/**
 * A microphone with something to show for itself: it draws what it is hearing
 * while it hears it, so the difference between a live microphone and a dead
 * one is visible rather than a matter of trust.
 *
 * It captures and hands back the recording. It does not transcribe, because
 * that is a service, not a component, and pretending otherwise would put a
 * vendor inside something you have to copy into your own project.
 */
export function VoiceInput({
  onResult,
  onStart,
  onStop,
  onStatusChange,
  maxDuration,
  color = "--primary",
  mimeType,
  label = "Record a message",
  disabled = false,
  className,
  children,
  ...rootProps
}: VoiceInputProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const [status, setStatus] = React.useState<VoiceInputStatus>("idle")
  const [elapsed, setElapsed] = React.useState(0)

  // The live sample the canvas reads. A ref, because a waveform arriving at
  // the frame rate is not something to re-render the tree for.
  const samples = React.useRef<Uint8Array<ArrayBuffer> | null>(null)
  const session = React.useRef<{
    stream: MediaStream
    audio: AudioContext
    analyser: AnalyserNode
    recorder: MediaRecorder
    chunks: Blob[]
  } | null>(null)

  const tokens = React.useMemo(
    () => (color.startsWith("--") ? [color, "--muted-foreground"] : []),
    [color]
  )
  const resolved = useThemeColors(rootRef, tokens)
  const ink = color.startsWith("--") ? resolved[color] : undefined

  // The server cannot know whether this browser can record, and most can, so
  // it renders as though it can and the client corrects that if it cannot.
  // Nothing to record with is a state to show, not a button that does nothing.
  const supported = React.useSyncExternalStore(noop, canRecord, () => true)
  const shown: VoiceInputStatus = supported ? status : "unsupported"

  const listening = shown === "listening"

  // A single painted frame is the right answer for decoration and the wrong
  // one for a live meter: it would sit frozen while the microphone was open.
  // Where motion is unwelcome the trace gives way to the words.
  const [reduced, setReduced] = React.useState(false)

  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)")
    const sync = () => setReduced(query.matches)

    sync()
    query.addEventListener("change", sync)
    return () => query.removeEventListener("change", sync)
  }, [])

  const announce = React.useCallback(
    (next: VoiceInputStatus) => {
      setStatus(next)
      onStatusChange?.(next)
    },
    [onStatusChange]
  )

  const release = React.useCallback(() => {
    const current = session.current
    if (!current) return

    session.current = null
    samples.current = null

    if (current.recorder.state !== "inactive") current.recorder.stop()
    for (const track of current.stream.getTracks()) track.stop()
    void current.audio.close().catch(() => {})
  }, [])

  React.useEffect(() => release, [release])

  React.useEffect(() => {
    if (!listening) return

    const started = Date.now()
    const timer = setInterval(
      () => setElapsed((Date.now() - started) / 1000),
      200
    )

    return () => clearInterval(timer)
  }, [listening])

  const stop = React.useCallback(() => {
    const current = session.current
    if (!current) return

    // The recorder hands over the audio on stop, so the blob is assembled in
    // its own handler rather than here.
    if (current.recorder.state !== "inactive") current.recorder.stop()
    announce("idle")
    onStop?.()
  }, [announce, onStop])

  React.useEffect(() => {
    if (!listening || maxDuration === undefined) return
    if (elapsed < maxDuration) return

    stop()
  }, [elapsed, listening, maxDuration, stop])

  const start = React.useCallback(async () => {
    if (session.current) return
    announce("requesting")

    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch (error) {
      // A refusal and a missing device are different things to say.
      announce(
        (error as DOMException)?.name === "NotAllowedError" ? "denied" : "error"
      )
      return
    }

    try {
      const audio = new AudioContext()
      const analyser = audio.createAnalyser()
      analyser.fftSize = 1024
      audio.createMediaStreamSource(stream).connect(analyser)

      const recorder = new MediaRecorder(
        stream,
        mimeType && MediaRecorder.isTypeSupported(mimeType)
          ? { mimeType }
          : undefined
      )
      const chunks: Blob[] = []

      recorder.addEventListener("dataavailable", (event) => {
        if (event.data.size > 0) chunks.push(event.data)
      })
      recorder.addEventListener("stop", () => {
        onResult?.(new Blob(chunks, { type: recorder.mimeType }))
        release()
      })

      session.current = { stream, audio, analyser, recorder, chunks }
      samples.current = new Uint8Array(analyser.frequencyBinCount)

      recorder.start()
      setElapsed(0)
      announce("listening")
      onStart?.()
    } catch {
      for (const track of stream.getTracks()) track.stop()
      announce("error")
    }
  }, [announce, mimeType, onResult, onStart, release])

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

      const current = session.current
      const data = samples.current

      // The surface already runs a frame loop, so the sample is taken here
      // rather than in a second one of our own.
      if (current && data) current.analyser.getByteTimeDomainData(data)
      const [r, g, b] = ink as SurfaceColor
      const middle = box.height / 2
      const bars = Math.max(8, Math.floor(box.width / 5))
      const width = box.width / bars

      context.fillStyle = `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`

      for (let bar = 0; bar < bars; bar += 1) {
        // A flat line when there is nothing to hear, rather than an empty box.
        let peak = 0.02

        if (data && data.length > 0) {
          const from = Math.floor((bar / bars) * data.length)
          const to = Math.floor(((bar + 1) / bars) * data.length)

          for (let at = from; at < to; at += 1) {
            peak = Math.max(peak, Math.abs((data[at]! - 128) / 128))
          }
        }

        const height = Math.max(2, peak * box.height * 0.9)
        const x = bar * width

        context.beginPath()
        context.roundRect(
          x + width * 0.2,
          middle - height / 2,
          Math.max(width * 0.6, 1),
          height,
          width * 0.3
        )
        context.fill()
      }
    },
    [ink]
  )

  const message: Record<VoiceInputStatus, string> = {
    unsupported: "Recording is not available in this browser.",
    idle: "Ready to record.",
    requesting: "Waiting for permission to use the microphone.",
    listening: `Recording, ${formatElapsed(elapsed)}.`,
    denied: "Microphone permission was refused.",
    error: "The microphone could not be started.",
  }

  const blocked = disabled || !supported || shown === "requesting"

  return (
    <div
      ref={rootRef}
      data-slot="voice-input"
      data-status={shown}
      className={cn(
        "border-border bg-background flex min-h-14 items-center gap-3 rounded-full border px-2 ps-3",
        className
      )}
      {...rootProps}
    >
      <button
        type="button"
        aria-label={listening ? "Stop recording" : label}
        aria-pressed={listening}
        disabled={blocked}
        onClick={() => (listening ? stop() : void start())}
        className={cn(
          "focus-visible:ring-ring inline-flex size-10 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50",
          listening
            ? "bg-foreground text-background"
            : "bg-muted text-foreground hover:bg-muted/70"
        )}
      >
        {shown === "unsupported" || shown === "denied" ? (
          <MicOff aria-hidden="true" size={17} />
        ) : listening ? (
          <Square aria-hidden="true" size={15} />
        ) : (
          <Mic aria-hidden="true" size={17} />
        )}
      </button>

      <div className="relative min-w-0 flex-1">
        {ink !== undefined && listening && !reduced ? (
          <RenderSurface<null, "2d">
            setup={setup}
            draw={draw}
            className="h-9 w-full"
            canvasClassName="h-full w-full"
          />
        ) : (
          // The same words are announced through the live region below, so
          // this is the visual half of one message rather than a second one.
          <p
            aria-hidden="true"
            className="text-muted-foreground truncate text-xs"
          >
            {children ?? message[shown]}
          </p>
        )}
      </div>

      {listening ? (
        <span
          data-slot="voice-input-elapsed"
          className="text-muted-foreground shrink-0 pe-2 font-mono text-xs tabular-nums"
        >
          {formatElapsed(elapsed)}
        </span>
      ) : null}

      <span aria-live="polite" className="sr-only">
        {message[shown]}
      </span>
    </div>
  )
}
