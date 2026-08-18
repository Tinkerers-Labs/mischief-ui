"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type StreamSource = AsyncIterable<string> | ReadableStream<string>

export type StreamingTextStatus = "idle" | "streaming" | "done" | "error"

export type StreamingTextProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> & {
  text?: string
  source?: StreamSource
  speed?: number
  streaming?: boolean
  cursor?: React.ReactNode | false
  announce?: "sentences" | "off"
  onDone?: (text: string) => void
  onError?: (error: unknown) => void
  onStatusChange?: (status: StreamingTextStatus) => void
}

const SENTENCE_END = /[.!?\n]/g
const IDLE_FLUSH_MS = 1000

type Run = {
  key: unknown
  text: string
  status: StreamingTextStatus
  announcedTo: number
  announced: string
  error?: unknown
}

function isReadableStream(
  source: StreamSource
): source is ReadableStream<string> {
  return typeof (source as ReadableStream<string>).getReader === "function"
}

async function* readSource(source: StreamSource) {
  if (!isReadableStream(source)) {
    yield* source
    return
  }

  const reader = source.getReader()

  try {
    for (;;) {
      const { done, value } = await reader.read()
      if (done) return
      if (value != null) yield value
    }
  } finally {
    reader.releaseLock()
  }
}

function lastSentenceBreak(value: string, from: number) {
  SENTENCE_END.lastIndex = from

  let index = -1
  let match: RegExpExecArray | null

  while ((match = SENTENCE_END.exec(value)) !== null) {
    index = match.index + 1
  }

  return index
}

function startRun(key: unknown): Run {
  return {
    key,
    text: "",
    status: key == null ? "idle" : "streaming",
    announcedTo: 0,
    announced: "",
  }
}

function appendChunk(run: Run, chunk: string): Run {
  const text = run.text + chunk
  const boundary = lastSentenceBreak(text, run.announcedTo)

  if (boundary <= run.announcedTo) return { ...run, text }

  return {
    ...run,
    text,
    announcedTo: boundary,
    announced: text.slice(run.announcedTo, boundary),
  }
}

function flushRun(run: Run, status: StreamingTextStatus): Run {
  const tail = run.text.slice(run.announcedTo)

  return {
    ...run,
    status,
    announcedTo: run.text.length,
    announced: tail.trim() ? tail : "",
  }
}

export function StreamingText({
  text,
  source,
  speed = 0,
  streaming,
  cursor,
  announce = "sentences",
  onDone,
  onError,
  onStatusChange,
  className,
  ...rootProps
}: StreamingTextProps) {
  const replays = source == null && text != null && speed > 0
  const runKey = source ?? (replays ? text : null)

  const [run, setRun] = React.useState<Run>(() => startRun(runKey))

  if (run.key !== runKey) setRun(startRun(runKey))

  const callbacks = React.useRef({ onDone, onError, onStatusChange })

  React.useEffect(() => {
    callbacks.current = { onDone, onError, onStatusChange }
  })

  React.useEffect(() => {
    callbacks.current.onStatusChange?.(run.status)
  }, [run.status])

  React.useEffect(() => {
    if (run.status === "done") callbacks.current.onDone?.(run.text)
    if (run.status === "error") callbacks.current.onError?.(run.error)
  }, [run.status, run.text, run.error])

  React.useEffect(() => {
    if (source == null) return

    const controller = new AbortController()

    void (async () => {
      try {
        for await (const chunk of readSource(source)) {
          if (controller.signal.aborted) return
          setRun((current) =>
            current.key === source ? appendChunk(current, chunk) : current
          )
        }

        if (controller.signal.aborted) return

        setRun((current) =>
          current.key === source ? flushRun(current, "done") : current
        )
      } catch (error) {
        if (controller.signal.aborted) return
        setRun((current) =>
          current.key === source
            ? { ...flushRun(current, "error"), error }
            : current
        )
      }
    })()

    return () => controller.abort()
  }, [source])

  React.useEffect(() => {
    if (!replays) return

    const full = text ?? ""
    const interval = Math.max(1000 / speed, 16)
    const step = Math.max(1, Math.round(speed / 60))
    let index = 0

    const timer = window.setInterval(() => {
      const next = Math.min(index + step, full.length)
      const chunk = full.slice(index, next)
      index = next

      setRun((current) => {
        if (current.key !== full) return current

        const advanced = appendChunk(current, chunk)
        if (index < full.length) return advanced

        return flushRun(advanced, "done")
      })

      if (index >= full.length) window.clearInterval(timer)
    }, interval)

    return () => window.clearInterval(timer)
  }, [replays, text, speed])

  const isLive = runKey != null || streaming != null
  const isStreaming = streaming ?? run.status === "streaming"
  const value = runKey == null ? (text ?? "") : run.text

  React.useEffect(() => {
    if (announce === "off" || !isLive || !isStreaming) return

    const timer = window.setTimeout(
      () =>
        setRun((current) =>
          current.announcedTo < current.text.length
            ? flushRun(current, current.status)
            : current
        ),
      IDLE_FLUSH_MS
    )

    return () => window.clearTimeout(timer)
  }, [announce, isLive, isStreaming, run.text])

  const showCursor = cursor !== false && isStreaming

  return (
    <div
      data-slot="streaming-text"
      data-status={run.status}
      className={cn("text-pretty whitespace-pre-wrap", className)}
      {...rootProps}
    >
      <span
        aria-hidden={isStreaming || undefined}
        data-slot="streaming-text-value"
      >
        {value}
      </span>

      {showCursor
        ? (cursor ?? (
            <span
              aria-hidden="true"
              data-slot="streaming-text-cursor"
              className="bg-foreground ml-0.5 inline-block h-[1em] w-[0.5ch] translate-y-[0.12em] animate-pulse motion-reduce:animate-none"
            />
          ))
        : null}

      {announce === "off" || !isLive ? null : (
        <span aria-live="polite" className="sr-only">
          {run.announced}
        </span>
      )}
    </div>
  )
}
