"use client"

import * as React from "react"
import { Check, Clipboard, Eye, EyeOff } from "lucide-react"

import { cn } from "@/lib/utils"

export type SecretFieldProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children" | "onCopy"
> & {
  value: string
  /** Characters left readable at the start and end while it is hidden. */
  visiblePrefix?: number
  visibleSuffix?: number
  masked?: boolean
  defaultMasked?: boolean
  onMaskedChange?: (masked: boolean) => void
  /** Drop the reveal control for a value that should never be shown. */
  revealable?: boolean
  copyable?: boolean
  onCopied?: (value: string) => void
  label?: string
}

const CONTROL =
  "text-muted-foreground hover:bg-muted hover:text-foreground inline-flex size-8 shrink-0 items-center justify-center rounded-md transition-colors duration-150 motion-reduce:transition-none"

/**
 * An API key, a token, a connection string. Hidden until asked for, copied
 * whole whether or not it is showing, and never announced as a run of dots.
 */
export function SecretField({
  value,
  visiblePrefix = 0,
  visibleSuffix = 4,
  masked: controlledMasked,
  defaultMasked = true,
  onMaskedChange,
  revealable = true,
  copyable = true,
  onCopied,
  label = "Secret",
  className,
  ...rootProps
}: SecretFieldProps) {
  const [ownMasked, setOwnMasked] = React.useState(defaultMasked)
  const [copyState, setCopyState] = React.useState<"idle" | "copied" | "error">(
    "idle"
  )
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    []
  )

  const masked = (controlledMasked ?? ownMasked) && revealable !== false

  const hidden = React.useMemo(() => {
    const head = value.slice(0, visiblePrefix)
    const tail = visibleSuffix > 0 ? value.slice(-visibleSuffix) : ""
    const middle = Math.max(0, value.length - head.length - tail.length)

    return `${head}${"•".repeat(Math.min(middle, 24))}${tail}`
  }, [value, visiblePrefix, visibleSuffix])

  function toggle() {
    const next = !masked
    if (controlledMasked === undefined) setOwnMasked(next)
    onMaskedChange?.(next)
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopyState("copied")
      onCopied?.(value)
    } catch {
      // Denied permission, an insecure context, or a sandboxed frame.
      setCopyState("error")
    }

    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopyState("idle"), 1600)
  }

  return (
    <div
      data-slot="secret-field"
      data-masked={masked || undefined}
      className={cn(
        "border-border bg-muted/40 flex min-w-0 items-center gap-2 rounded-[calc(var(--radius)+0.15rem)] border px-3 py-1.5",
        className
      )}
      {...rootProps}
    >
      {/*
       * A masked value is read as a row of bullets, which is worse than
       * useless, so the text is hidden and the state is said in words.
       */}
      <code
        aria-hidden={masked || undefined}
        data-slot="secret-field-value"
        className="min-w-0 flex-1 truncate font-[family-name:var(--font-mono),monospace] text-xs"
      >
        {masked ? hidden : value}
      </code>
      {masked ? (
        <span className="sr-only">{label} hidden</span>
      ) : (
        <span className="sr-only">{label} showing</span>
      )}

      {revealable && (
        <button
          type="button"
          data-slot="secret-field-reveal"
          aria-label={
            masked
              ? `Show ${label.toLowerCase()}`
              : `Hide ${label.toLowerCase()}`
          }
          aria-pressed={!masked}
          className={CONTROL}
          onClick={toggle}
        >
          {masked ? (
            <Eye aria-hidden="true" size={14} />
          ) : (
            <EyeOff aria-hidden="true" size={14} />
          )}
        </button>
      )}

      {copyable && (
        <button
          type="button"
          data-slot="secret-field-copy"
          aria-label={
            copyState === "copied"
              ? "Copied"
              : copyState === "error"
                ? "Copy failed"
                : `Copy ${label.toLowerCase()}`
          }
          className={CONTROL}
          onClick={copy}
        >
          {copyState === "copied" ? (
            <Check aria-hidden="true" size={14} />
          ) : (
            <Clipboard aria-hidden="true" size={14} />
          )}
        </button>
      )}

      <span aria-live="polite" className="sr-only">
        {copyState === "copied"
          ? `${label} copied to clipboard.`
          : copyState === "error"
            ? `${label} could not be copied.`
            : ""}
      </span>
    </div>
  )
}
