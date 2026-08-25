"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export type TranscriptCue = {
  id: string
  /** Seconds from the start of the recording. */
  start: number
  end?: number
  speaker?: string
  text: string
}

export type TranscriptViewerProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onSelect"
> & {
  cues: readonly TranscriptCue[]
  /** Where the recording is now, in seconds. */
  time?: number
  onSeek?: (cue: TranscriptCue) => void
  /** Follows the recording as it plays. On by default. */
  follow?: boolean
  label?: string
}

function clock(seconds: number) {
  const whole = Math.max(0, Math.floor(seconds))
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`
}

/** The cue covering a moment, or the last one that started before it. */
function cueAt(cues: readonly TranscriptCue[], time: number) {
  let current: TranscriptCue | undefined

  for (const cue of cues) {
    if (cue.start > time) break
    if (cue.end !== undefined && cue.end < time) {
      current = cue
      continue
    }
    current = cue
  }

  return current
}

/**
 * A recording as text, in the order it was said, with each line a way back to
 * the moment it was said at. Reading a transcript and scrubbing a recording
 * are the same act here rather than two.
 */
export function TranscriptViewer({
  cues,
  time,
  onSeek,
  follow = true,
  label = "Transcript",
  className,
  ...rootProps
}: TranscriptViewerProps) {
  const active = time === undefined ? undefined : cueAt(cues, time)
  const listRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!follow || !active) return

    const row = listRef.current?.querySelector<HTMLElement>(
      `[data-cue="${CSS.escape(active.id)}"]`
    )

    // Nearest, so following never yanks the reader further than it must.
    row?.scrollIntoView({ block: "nearest" })
  }, [active, follow])

  return (
    <div
      data-slot="transcript-viewer"
      className={cn(
        "border-border bg-muted/40 overflow-hidden rounded-[calc(var(--radius)+0.15rem)] border",
        className
      )}
      {...rootProps}
    >
      <div
        ref={listRef}
        aria-label={label}
        className="max-h-80 overflow-y-auto p-1"
      >
        {cues.map((cue) => {
          const here = active?.id === cue.id

          return (
            <button
              key={cue.id}
              type="button"
              data-cue={cue.id}
              aria-current={here ? "true" : undefined}
              onClick={() => onSeek?.(cue)}
              className={cn(
                "focus-visible:ring-ring grid w-full grid-cols-[3.25rem_1fr] gap-3 rounded-lg px-2 py-2 text-left focus-visible:ring-2 focus-visible:outline-none",
                here ? "bg-background" : "hover:bg-background/60"
              )}
            >
              <span
                className={cn(
                  "font-mono text-xs tabular-nums",
                  here ? "text-primary" : "text-muted-foreground"
                )}
              >
                {clock(cue.start)}
              </span>

              <span className="min-w-0">
                {cue.speaker ? (
                  <span className="text-muted-foreground mr-2 text-xs font-semibold">
                    {cue.speaker}
                  </span>
                ) : null}
                <span
                  className={cn(
                    "text-sm",
                    here ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {cue.text}
                </span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
