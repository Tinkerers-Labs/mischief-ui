"use client"

import * as React from "react"
import { Mic, Square } from "lucide-react"

import { cn } from "@/lib/utils"

export type MicSelectorStatus =
  "unsupported" | "idle" | "requesting" | "testing" | "denied" | "error"

export type MicSelectorProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onChange" | "onError" | "children"
> & {
  /** The chosen device, when you hold the value yourself. */
  value?: string
  defaultValue?: string
  onValueChange?: (deviceId: string) => void
  onStatusChange?: (status: MicSelectorStatus) => void
  /** Segments in the level meter. */
  segments?: number
  label?: string
  disabled?: boolean
}

const SEGMENTS = 12

const noop = () => () => {}

function canEnumerate() {
  return Boolean(navigator.mediaDevices?.enumerateDevices)
}

/**
 * Picks which microphone to use, and answers the question that follows it by
 * lighting a meter from the one you chose.
 *
 * Device labels are withheld until a page has been granted the microphone
 * once, so an untested list reads "Microphone 1, Microphone 2" and fills in
 * with real names as soon as the test is run.
 */
export function MicSelector({
  value,
  defaultValue = "",
  onValueChange,
  onStatusChange,
  segments = SEGMENTS,
  label = "Microphone",
  disabled = false,
  className,
  ...rootProps
}: MicSelectorProps) {
  const [devices, setDevices] = React.useState<MediaDeviceInfo[]>([])
  const [chosen, setChosen] = React.useState(defaultValue)
  const [status, setStatus] = React.useState<MicSelectorStatus>("idle")
  const [level, setLevel] = React.useState(0)
  const deviceId = React.useId()

  const session = React.useRef<{
    stream: MediaStream
    audio: AudioContext
    frame: number
  } | null>(null)

  const supported = React.useSyncExternalStore(noop, canEnumerate, () => true)
  const shown: MicSelectorStatus = supported ? status : "unsupported"
  const selected = value ?? chosen
  const testing = shown === "testing"

  const announce = React.useCallback(
    (next: MicSelectorStatus) => {
      setStatus(next)
      onStatusChange?.(next)
    },
    [onStatusChange]
  )

  const list = React.useCallback(() => {
    if (!canEnumerate()) return

    navigator.mediaDevices
      .enumerateDevices()
      .then((found) =>
        setDevices(found.filter((device) => device.kind === "audioinput"))
      )
      .catch(() => {})
  }, [])

  React.useEffect(() => {
    list()
    if (!navigator.mediaDevices?.addEventListener) return

    const sync = () => list()
    navigator.mediaDevices.addEventListener("devicechange", sync)
    return () =>
      navigator.mediaDevices.removeEventListener("devicechange", sync)
  }, [list])

  const release = React.useCallback(() => {
    const current = session.current
    if (!current) return

    session.current = null
    cancelAnimationFrame(current.frame)
    for (const track of current.stream.getTracks()) track.stop()
    void current.audio.close().catch(() => {})
    setLevel(0)
  }, [])

  React.useEffect(() => release, [release])

  const test = React.useCallback(async () => {
    if (session.current) return
    announce("requesting")

    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: selected ? { deviceId: { exact: selected } } : true,
      })
    } catch (error) {
      announce(
        (error as DOMException)?.name === "NotAllowedError" ? "denied" : "error"
      )
      return
    }

    try {
      const audio = new AudioContext()
      const analyser = audio.createAnalyser()
      analyser.fftSize = 512
      audio.createMediaStreamSource(stream).connect(analyser)

      const data = new Uint8Array(analyser.frequencyBinCount)
      const read = () => {
        if (!session.current) return

        analyser.getByteTimeDomainData(data)
        let sum = 0
        for (const sample of data) sum += ((sample - 128) / 128) ** 2

        setLevel(Math.min(1, Math.sqrt(sum / data.length) * 2.5))
        session.current.frame = requestAnimationFrame(read)
      }

      session.current = { stream, audio, frame: 0 }
      session.current.frame = requestAnimationFrame(read)

      // Permission is what unlocks the real device names.
      list()
      announce("testing")
    } catch {
      for (const track of stream.getTracks()) track.stop()
      announce("error")
    }
  }, [announce, list, selected])

  const choose = (deviceId: string) => {
    release()
    if (status === "testing") announce("idle")
    if (value === undefined) setChosen(deviceId)
    onValueChange?.(deviceId)
  }

  const message: Record<MicSelectorStatus, string> = {
    unsupported: "This browser cannot list audio devices.",
    idle: "Test to check the microphone is picking you up.",
    requesting: "Waiting for permission to use the microphone.",
    testing: "Testing. Speak, and the meter should move.",
    denied: "Microphone permission was refused.",
    error: "The microphone could not be started.",
  }

  const lit = Math.round(level * segments)

  return (
    <div
      data-slot="mic-selector"
      data-status={shown}
      className={cn(
        "border-border bg-background flex w-full flex-col gap-3 rounded-xl border p-3",
        className
      )}
      {...rootProps}
    >
      <div className="flex items-center gap-2">
        <label className="sr-only" htmlFor={deviceId}>
          {label}
        </label>
        <select
          id={deviceId}
          value={selected}
          disabled={disabled || !supported || devices.length === 0}
          onChange={(event) => choose(event.target.value)}
          className="border-border bg-background focus-visible:ring-ring h-10 min-w-0 flex-1 rounded-md border px-2 text-sm focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50"
        >
          {devices.length === 0 ? (
            <option value="">No microphone found</option>
          ) : null}
          {devices.map((device, at) => (
            <option key={device.deviceId || at} value={device.deviceId}>
              {device.label || `Microphone ${at + 1}`}
            </option>
          ))}
        </select>

        <button
          type="button"
          aria-label={testing ? `Stop testing ${label}` : `Test ${label}`}
          aria-pressed={testing}
          disabled={disabled || !supported || shown === "requesting"}
          onClick={() => {
            if (testing) {
              release()
              announce("idle")
            } else {
              void test()
            }
          }}
          className={cn(
            "focus-visible:ring-ring inline-flex h-10 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50 motion-reduce:transition-none",
            testing
              ? "bg-foreground text-background"
              : "bg-muted text-foreground hover:bg-muted/70"
          )}
        >
          {testing ? (
            <Square aria-hidden="true" size={13} />
          ) : (
            <Mic aria-hidden="true" size={15} />
          )}
          {testing ? "Stop" : "Test"}
        </button>
      </div>

      <div
        data-slot="mic-selector-meter"
        aria-hidden="true"
        className="flex h-2 items-stretch gap-1"
      >
        {Array.from({ length: segments }, (_, segment) => (
          <span
            key={segment}
            data-lit={segment < lit ? "" : undefined}
            className="bg-muted data-lit:bg-primary min-w-0 flex-1 rounded-full transition-colors duration-100 motion-reduce:transition-none"
          />
        ))}
      </div>

      {/* The live region below carries the same words, so this is the
          visible half of one message rather than a second one. */}
      <p aria-hidden="true" className="text-muted-foreground text-xs">
        {message[shown]}
      </p>

      <span aria-live="polite" className="sr-only">
        {message[shown]}
      </span>
    </div>
  )
}
