"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export type SaveBarState = "clean" | "dirty" | "saving" | "saved" | "error"

export interface SaveBarProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> {
  /** Whether the form is holding changes nobody has saved yet. */
  dirty: boolean
  /** A rejection is the failed state. Anything else counts as saved. */
  onSave: () => void | Promise<void>
  /** Omit it and no Reset button is drawn. */
  onReset?: () => void
  onSaveError?: (error: unknown) => void
  message?: string
  savingMessage?: string
  savedMessage?: string
  errorMessage?: string
  saveLabel?: string
  resetLabel?: string
  retryLabel?: string
  /** Saves on Cmd+S and Ctrl+S while there is something to save. */
  shortcut?: boolean
  /** Asks the browser to confirm a reload or a close while work is unsaved. */
  warnOnLeave?: boolean
  /** The accessible name of the bar. */
  label?: string
}

/** Long enough to cover the check's path once, so it draws rather than jumps. */
const CHECK_LENGTH = 14

export const SaveBar = React.forwardRef<HTMLDivElement, SaveBarProps>(
  function SaveBar(
    {
      className,
      dirty,
      errorMessage = "Could not save",
      label = "Save changes",
      message = "Unsaved changes",
      onReset,
      onSave,
      onSaveError,
      resetLabel = "Reset",
      retryLabel = "Try again",
      saveLabel = "Save",
      savedMessage = "Saved",
      savingMessage = "Saving",
      shortcut = true,
      warnOnLeave = true,
      ...rootProps
    },
    forwardedRef
  ) {
    const [status, setStatus] = React.useState<
      "idle" | "saving" | "saved" | "error"
    >("idle")
    const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

    React.useEffect(
      () => () => {
        if (timer.current) clearTimeout(timer.current)
      },
      []
    )

    // A failure is worth keeping up only while there is still something to
    // retry, so a form the host reset takes the message away with it.
    const state: SaveBarState =
      status === "saving"
        ? "saving"
        : status === "saved"
          ? "saved"
          : status === "error" && dirty
            ? "error"
            : dirty
              ? "dirty"
              : "clean"

    const shown = state !== "clean"
    const busy = state === "saving"

    const save = React.useCallback(async () => {
      if (timer.current) clearTimeout(timer.current)
      setStatus("saving")

      try {
        await onSave()
        setStatus("saved")
        // The confirmation is the reason the bar is still here. Once it has
        // been read, a clean form has nothing left to say.
        timer.current = setTimeout(() => setStatus("idle"), 1200)
      } catch (error) {
        setStatus("error")
        onSaveError?.(error)
      }
    }, [onSave, onSaveError])

    React.useEffect(() => {
      if (!shortcut || !dirty || busy) return

      function handleKeyDown(event: KeyboardEvent) {
        if (!event.metaKey && !event.ctrlKey) return
        if (event.key.toLowerCase() !== "s") return

        event.preventDefault()
        void save()
      }

      window.addEventListener("keydown", handleKeyDown)
      return () => window.removeEventListener("keydown", handleKeyDown)
    }, [busy, dirty, save, shortcut])

    React.useEffect(() => {
      if (!warnOnLeave || !dirty) return

      function warn(event: BeforeUnloadEvent) {
        // preventDefault is the current spec; returnValue is what older
        // browsers still read the intent from.
        event.preventDefault()
        event.returnValue = ""
      }

      window.addEventListener("beforeunload", warn)
      return () => window.removeEventListener("beforeunload", warn)
    }, [dirty, warnOnLeave])

    const text =
      state === "saving"
        ? savingMessage
        : state === "saved"
          ? savedMessage
          : state === "error"
            ? errorMessage
            : message

    const action =
      "min-h-8 rounded-full px-3 text-sm transition-colors duration-150 focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-60 motion-reduce:transition-none"

    return (
      <>
        <div
          aria-hidden={!shown || undefined}
          aria-label={label}
          data-slot="save-bar"
          data-state={state}
          ref={forwardedRef}
          role="region"
          className={cn(
            "bg-background text-foreground border-border fixed inset-x-4 bottom-6 z-40 mx-auto flex max-w-md items-center gap-3 rounded-full border py-2 pr-2 pl-4 shadow-lg transition-[opacity,transform] duration-200 motion-reduce:transition-none",
            shown
              ? "translate-y-0 opacity-100"
              : "pointer-events-none translate-y-4 opacity-0",
            className
          )}
          {...rootProps}
        >
          <span aria-hidden="true" className="relative size-4 shrink-0">
            <span
              className={cn(
                "absolute inset-[4px] rounded-full transition-[opacity,transform] duration-200 motion-reduce:transition-none",
                state === "error" ? "bg-destructive" : "bg-muted-foreground",
                state === "dirty" || state === "error"
                  ? "scale-100 opacity-100"
                  : "scale-50 opacity-0"
              )}
            />
            <svg
              className={cn(
                "absolute inset-0 animate-spin transition-opacity duration-200 motion-reduce:animate-none motion-reduce:transition-none",
                busy ? "opacity-100" : "opacity-0"
              )}
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-20"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2.5"
              />
              <path
                d="M12 2a10 10 0 0 1 10 10"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="2.5"
              />
            </svg>
            <svg
              className={cn(
                "absolute inset-0 transition-opacity duration-200 motion-reduce:transition-none",
                state === "saved" ? "opacity-100" : "opacity-0"
              )}
              fill="none"
              viewBox="0 0 16 16"
            >
              {/* Drawn rather than swapped in, so the confirmation has the
                  same cause the bar's own arrival does. */}
              <path
                className="transition-[stroke-dashoffset] duration-300 ease-out motion-reduce:transition-none"
                d="M3.5 8.5 6.5 11.5 12.5 5"
                stroke="currentColor"
                strokeDasharray={CHECK_LENGTH}
                strokeDashoffset={state === "saved" ? 0 : CHECK_LENGTH}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
          </span>

          <p className="min-w-0 flex-1 truncate text-sm">{text}</p>

          {onReset ? (
            <button
              className={cn(
                action,
                "text-muted-foreground hover:text-foreground"
              )}
              disabled={busy}
              onClick={onReset}
              tabIndex={shown ? undefined : -1}
              type="button"
            >
              {resetLabel}
            </button>
          ) : null}

          <button
            className={cn(
              action,
              "bg-primary text-primary-foreground px-4 font-medium"
            )}
            disabled={busy}
            onClick={() => void save()}
            tabIndex={shown ? undefined : -1}
            type="button"
          >
            {state === "error" ? retryLabel : saveLabel}
          </button>
        </div>

        {/* Kept outside the bar, because a live region that was hidden a
            moment ago is not reliably read when it reappears. */}
        <span aria-live="polite" className="sr-only">
          {shown ? text : ""}
        </span>
      </>
    )
  }
)
