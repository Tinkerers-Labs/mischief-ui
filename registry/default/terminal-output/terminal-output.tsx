"use client"

import * as React from "react"
import { ChevronRight, Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

export type TerminalStream = "stdout" | "stderr"

export type TerminalLine = {
  text: string
  stream?: TerminalStream
}

export type TerminalOutputProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> & {
  /** The command that produced this output, shown above it. */
  command?: string
  cwd?: string
  /** A plain string is split on newlines and treated as stdout. */
  output: string | readonly (TerminalLine | string)[]
  running?: boolean
  /** Shown once the command settles. Non-zero reads as a failure. */
  exitCode?: number
  maxHeight?: number | string
  /** Keep the newest line in view while output arrives. */
  follow?: boolean
}

// Written without a control character in the source so the pattern stays
// readable and lint-clean. Covers the colour and cursor sequences a shell
// emits; anything else is left alone rather than guessed at.
const ANSI = new RegExp("\\u001B\\[[0-9;?]*[ -/]*[@-~]", "g")

function toLines(
  output: TerminalOutputProps["output"]
): readonly TerminalLine[] {
  const raw =
    typeof output === "string"
      ? output
          .replace(/\n$/, "")
          .split("\n")
          .map((text) => ({ text }))
      : output.map((line) => (typeof line === "string" ? { text: line } : line))

  return raw.map((line) => ({ ...line, text: line.text.replace(ANSI, "") }))
}

export function TerminalOutput({
  command,
  cwd,
  output,
  running = false,
  exitCode,
  maxHeight = "18rem",
  follow = true,
  className,
  ...rootProps
}: TerminalOutputProps) {
  const lines = React.useMemo(() => toLines(output), [output])
  const scroller = React.useRef<HTMLDivElement>(null)
  const stuck = React.useRef(true)

  React.useEffect(() => {
    const element = scroller.current
    if (!follow || !element || !stuck.current) return

    element.scrollTop = element.scrollHeight
  }, [lines, follow])

  // Following is abandoned as soon as the reader scrolls up, and resumes when
  // they come back to the bottom, so output never yanks the view away.
  function onScroll(event: React.UIEvent<HTMLDivElement>) {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget
    stuck.current = scrollHeight - scrollTop - clientHeight < 24
  }

  const settled = !running && exitCode !== undefined
  const failed = settled && exitCode !== 0

  return (
    <div
      data-slot="terminal-output"
      className={cn(
        "border-border bg-muted/40 min-w-0 overflow-hidden rounded-[calc(var(--radius)+0.15rem)] border",
        className
      )}
      {...rootProps}
    >
      {command ? (
        <div
          data-slot="terminal-output-command"
          className="border-border flex items-center gap-2 border-b px-3 py-1.5"
        >
          <ChevronRight
            aria-hidden="true"
            size={13}
            className="text-primary shrink-0"
          />
          <code className="text-foreground min-w-0 truncate font-[family-name:var(--font-mono),monospace] text-xs">
            {command}
          </code>
          {cwd ? (
            <span className="text-muted-foreground ml-auto hidden shrink-0 truncate font-[family-name:var(--font-mono),monospace] text-[0.6875rem] sm:block">
              {cwd}
            </span>
          ) : null}
        </div>
      ) : null}

      <div
        ref={scroller}
        onScroll={onScroll}
        tabIndex={0}
        role="log"
        aria-label="Command output"
        aria-busy={running}
        className="overflow-auto px-3 py-2.5"
        style={{ maxHeight }}
      >
        <pre className="text-foreground m-0 rounded-none bg-transparent p-0 font-[family-name:var(--font-mono),monospace] text-xs leading-relaxed">
          <code>
            {lines.map((line, index) => (
              <span
                key={index}
                data-stream={line.stream ?? "stdout"}
                className={cn(
                  "block break-words whitespace-pre-wrap",
                  line.stream === "stderr" && "text-destructive"
                )}
              >
                {line.text === "" ? " " : line.text}
              </span>
            ))}
          </code>
        </pre>

        {running ? (
          <span className="text-muted-foreground mt-1 inline-flex items-center gap-1.5 text-xs">
            <Loader2
              aria-hidden="true"
              size={12}
              className="animate-spin motion-reduce:animate-none"
            />
            Running
          </span>
        ) : null}
      </div>

      {settled ? (
        <div
          data-slot="terminal-output-status"
          data-failed={failed || undefined}
          className={cn(
            "border-border border-t px-3 py-1.5 font-[family-name:var(--font-mono),monospace] text-[0.6875rem]",
            failed ? "text-destructive" : "text-muted-foreground"
          )}
        >
          exit {exitCode}
        </div>
      ) : null}
    </div>
  )
}
