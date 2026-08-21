"use client"

import * as React from "react"
import { Check, Clipboard } from "lucide-react"

import { cn } from "@/lib/utils"

export type CopyButtonProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "value"
> & {
  value: string
  /** Shown beside the icon. Omit for an icon-only control. */
  children?: React.ReactNode
  label?: string
  copiedLabel?: string
  errorLabel?: string
  onCopied?: (value: string) => void
  onCopyError?: (error: unknown) => void
}

export function CopyButton({
  value,
  children,
  label = "Copy",
  copiedLabel = "Copied",
  errorLabel = "Copy failed",
  onCopied,
  onCopyError,
  className,
  onClick,
  ...buttonProps
}: CopyButtonProps) {
  const [state, setState] = React.useState<"idle" | "copied" | "error">("idle")
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    []
  )

  async function copy(event: React.MouseEvent<HTMLButtonElement>) {
    onClick?.(event)
    if (event.defaultPrevented) return

    try {
      await navigator.clipboard.writeText(value)
      setState("copied")
      onCopied?.(value)
    } catch (error) {
      // Denied permission, an insecure context, or a sandboxed frame.
      setState("error")
      onCopyError?.(error)
    }

    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setState("idle"), 1600)
  }

  const name =
    state === "copied" ? copiedLabel : state === "error" ? errorLabel : label

  return (
    <button
      type="button"
      data-slot="copy-button"
      data-state={state}
      aria-label={children ? undefined : name}
      className={cn(
        "text-muted-foreground hover:bg-muted hover:text-foreground inline-flex min-h-8 items-center gap-1.5 rounded-md px-2 text-xs transition-colors duration-150 motion-reduce:transition-none",
        className
      )}
      onClick={copy}
      {...buttonProps}
    >
      {state === "copied" ? (
        <Check aria-hidden="true" size={14} />
      ) : (
        <Clipboard aria-hidden="true" size={14} />
      )}
      {children}
      {/* The outcome is announced whether or not the label is visible. */}
      <span aria-live="polite" className="sr-only">
        {state === "idle" ? "" : name}
      </span>
    </button>
  )
}
