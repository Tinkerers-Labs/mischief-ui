"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface FeedbackSentiment {
  value: string
  label: string
  icon?: React.ReactNode
}

export interface FeedbackWidgetValue {
  sentiment: string | null
  message: string
}

export type FeedbackWidgetState =
  "closed" | "open" | "sending" | "sent" | "error"

export interface FeedbackWidgetProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children" | "onSubmit"
> {
  /** A rejection is the failed state, and the text is kept for a retry. */
  onSubmit: (value: FeedbackWidgetValue) => void | Promise<void>
  onSubmitError?: (error: unknown) => void
  /** Pass an empty array to leave the sentiment question out. */
  sentiments?: FeedbackSentiment[]
  triggerLabel?: string
  title?: string
  sentimentLabel?: string
  messageLabel?: string
  placeholder?: string
  sendLabel?: string
  sendingLabel?: string
  sentMessage?: string
  errorMessage?: string
  retryLabel?: string
  closeLabel?: string
}

function Face({ mouth }: { mouth: string }) {
  return (
    <svg aria-hidden="true" className="size-6" fill="none" viewBox="0 0 24 24">
      <circle
        cx="12"
        cy="12"
        r="9.25"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="9" cy="10" r="1.1" fill="currentColor" />
      <circle cx="15" cy="10" r="1.1" fill="currentColor" />
      <path
        d={mouth}
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
    </svg>
  )
}

export const defaultFeedbackSentiments: FeedbackSentiment[] = [
  {
    value: "great",
    label: "Great",
    icon: <Face mouth="M8 14c2.2 2.6 5.8 2.6 8 0" />,
  },
  {
    value: "fine",
    label: "Fine",
    icon: <Face mouth="M8.5 14.5c1.8 1.2 5.2 1.2 7 0" />,
  },
  { value: "meh", label: "Not great", icon: <Face mouth="M9 15h6" /> },
  {
    value: "bad",
    label: "Bad",
    icon: <Face mouth="M8 16c2.2-2.4 5.8-2.4 8 0" />,
  },
]

const CHECK_LENGTH = 20

const MORPH =
  "transition-[width,height,border-radius] duration-300 ease-[cubic-bezier(0.3,1.2,0.5,1)] motion-reduce:transition-none"

export const FeedbackWidget = React.forwardRef<
  HTMLDivElement,
  FeedbackWidgetProps
>(function FeedbackWidget(
  {
    className,
    closeLabel = "Close",
    errorMessage = "Could not send. Your message is still here.",
    messageLabel = "Message",
    onKeyDown,
    onSubmit,
    onSubmitError,
    placeholder = "What happened, or what would help?",
    retryLabel = "Try again",
    sendLabel = "Send",
    sendingLabel = "Sending",
    sentMessage = "Thanks. We read every note.",
    sentimentLabel = "How is it going?",
    sentiments = defaultFeedbackSentiments,
    title = "Send feedback",
    triggerLabel = "Feedback",
    ...rootProps
  },
  forwardedRef
) {
  const titleId = React.useId()
  const groupName = React.useId()
  const rootRef = React.useRef<HTMLDivElement | null>(null)
  const contentRef = React.useRef<HTMLDivElement | null>(null)
  const triggerRef = React.useRef<HTMLButtonElement | null>(null)
  const dialogRef = React.useRef<HTMLDivElement | null>(null)
  const messageRef = React.useRef<HTMLTextAreaElement | null>(null)
  const returnFocusRef = React.useRef(false)

  const [open, setOpen] = React.useState(false)
  const [status, setStatus] = React.useState<
    "idle" | "sending" | "sent" | "error"
  >("idle")
  const [sentiment, setSentiment] = React.useState<string | null>(null)
  const [message, setMessage] = React.useState("")
  const [size, setSize] = React.useState<{ w: number; h: number } | null>(null)

  const state: FeedbackWidgetState = !open
    ? "closed"
    : status === "idle"
      ? "open"
      : status
  const ready = Boolean(message.trim() || sentiment)

  const close = React.useCallback(() => {
    returnFocusRef.current = true
    setOpen(false)
    setStatus((current) => (current === "sending" ? current : "idle"))
  }, [])

  React.useEffect(() => {
    const content = contentRef.current
    if (!content || typeof ResizeObserver === "undefined") return

    const observer = new ResizeObserver(() => {
      setSize({ w: content.offsetWidth, h: content.offsetHeight })
    })
    observer.observe(content)
    return () => observer.disconnect()
  }, [])

  React.useEffect(() => {
    if (open) {
      if (status === "sent") dialogRef.current?.focus()
      else if (status === "idle") messageRef.current?.focus()
      return
    }
    if (returnFocusRef.current) {
      returnFocusRef.current = false
      triggerRef.current?.focus()
    }
  }, [open, status])

  React.useEffect(() => {
    if (!open || status !== "sent") return
    const timer = setTimeout(close, 1600)
    return () => clearTimeout(timer)
  }, [close, open, status])

  React.useEffect(() => {
    if (!open) return

    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
        setStatus((current) => (current === "sending" ? current : "idle"))
      }
    }

    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [open])

  async function send() {
    if (status === "sending" || !ready) return
    setStatus("sending")
    try {
      await onSubmit({ sentiment, message: message.trim() })
      setStatus("sent")
      setSentiment(null)
      setMessage("")
    } catch (error) {
      setStatus("error")
      onSubmitError?.(error)
    }
  }

  const announcement =
    state === "sending"
      ? sendingLabel
      : state === "sent"
        ? sentMessage
        : state === "error"
          ? errorMessage
          : ""

  return (
    <div
      {...rootProps}
      ref={(node) => {
        rootRef.current = node
        if (typeof forwardedRef === "function") forwardedRef(node)
        else if (forwardedRef) forwardedRef.current = node
      }}
      data-slot="feedback-widget"
      data-state={state}
      onKeyDown={(event) => {
        onKeyDown?.(event)
        if (event.defaultPrevented || !open) return

        if (event.key === "Escape") {
          event.preventDefault()
          close()
          return
        }

        if (event.key !== "Tab" || !dialogRef.current) return
        const buttons = Array.from(
          dialogRef.current.querySelectorAll("button")
        ).filter((node) => !node.closest("[inert]"))
        const first = buttons[0]
        const last = buttons[buttons.length - 1]
        if (!first || !last) return

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (
          !event.shiftKey &&
          (document.activeElement === last ||
            document.activeElement === dialogRef.current)
        ) {
          event.preventDefault()
          first.focus()
        }
      }}
      className={cn("fixed right-4 bottom-4 z-50", className)}
    >
      <div
        className={cn(
          "border-border bg-background text-foreground ml-auto overflow-hidden border shadow-lg",
          MORPH,
          open ? "rounded-[1.25rem]" : "rounded-[1.375rem]"
        )}
        style={size ? { width: size.w, height: size.h } : undefined}
      >
        <div ref={contentRef} className="w-max">
          {open ? (
            <div
              ref={dialogRef}
              role="dialog"
              aria-labelledby={titleId}
              tabIndex={-1}
              className="w-[min(20rem,calc(100vw-2rem))] p-4 outline-none"
            >
              <div className="flex items-center justify-between gap-2">
                <p id={titleId} className="text-sm font-semibold">
                  {title}
                </p>
                <button
                  type="button"
                  aria-label={closeLabel}
                  onClick={close}
                  className="text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-ring -mr-1.5 grid size-8 place-items-center rounded-full outline-none focus-visible:ring-2"
                >
                  <svg
                    aria-hidden="true"
                    className="size-3.5"
                    fill="none"
                    viewBox="0 0 14 14"
                  >
                    <path
                      d="m3.5 3.5 7 7m0-7-7 7"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeWidth="1.75"
                    />
                  </svg>
                </button>
              </div>

              <div className="mt-3 grid [&>*]:[grid-area:1/1]">
                <form
                  inert={status === "sent"}
                  className={cn("grid gap-3", status === "sent" && "invisible")}
                  aria-busy={status === "sending" || undefined}
                  onSubmit={(event) => {
                    event.preventDefault()
                    void send()
                  }}
                >
                  {sentiments.length ? (
                    <fieldset className="grid gap-2">
                      <legend className="text-muted-foreground mb-2 text-xs">
                        {sentimentLabel}
                      </legend>
                      <div className="grid auto-cols-fr grid-flow-col gap-1.5">
                        {sentiments.map((option) => (
                          <label
                            key={option.value}
                            className="border-border text-muted-foreground hover:bg-muted has-[:checked]:border-foreground has-[:checked]:text-foreground has-[:focus-visible]:ring-ring flex min-h-14 cursor-pointer flex-col items-center justify-center gap-1 rounded-[var(--radius)] border px-1 py-1.5 text-[11px] leading-tight transition-colors duration-150 has-[:focus-visible]:ring-2 motion-reduce:transition-none"
                          >
                            <input
                              type="radio"
                              name={groupName}
                              value={option.value}
                              checked={sentiment === option.value}
                              onChange={() => setSentiment(option.value)}
                              className="sr-only"
                            />
                            {option.icon}
                            <span>{option.label}</span>
                          </label>
                        ))}
                      </div>
                    </fieldset>
                  ) : null}

                  <label className="grid gap-1.5">
                    <span className="text-muted-foreground text-xs">
                      {messageLabel}
                    </span>
                    <textarea
                      ref={messageRef}
                      value={message}
                      readOnly={status === "sending"}
                      onChange={(event) => setMessage(event.target.value)}
                      onKeyDown={(event) => {
                        if (
                          event.key === "Enter" &&
                          (event.metaKey || event.ctrlKey)
                        ) {
                          event.preventDefault()
                          void send()
                        }
                      }}
                      placeholder={placeholder}
                      rows={4}
                      className="border-border bg-background placeholder:text-muted-foreground focus-visible:ring-ring resize-none rounded-[var(--radius)] border px-3 py-2 text-sm outline-none focus-visible:ring-2"
                    />
                  </label>

                  {status === "error" ? (
                    <p className="text-destructive text-xs">{errorMessage}</p>
                  ) : null}

                  <button
                    type="submit"
                    aria-disabled={!ready || status === "sending"}
                    className="bg-primary text-primary-foreground focus-visible:ring-ring/50 inline-flex min-h-10 items-center justify-center gap-2 rounded-[var(--radius)] px-4 text-sm font-medium outline-none focus-visible:ring-4 aria-disabled:opacity-60"
                  >
                    {status === "sending" ? (
                      <svg
                        aria-hidden="true"
                        className="size-4 animate-spin motion-reduce:animate-none"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="3"
                        />
                        <path
                          d="M12 2a10 10 0 0 1 10 10"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeWidth="3"
                        />
                      </svg>
                    ) : null}
                    {status === "sending"
                      ? sendingLabel
                      : status === "error"
                        ? retryLabel
                        : sendLabel}
                  </button>
                </form>
                <div
                  inert={status !== "sent"}
                  className={cn(
                    "flex flex-col items-center justify-center gap-3 text-center",
                    status !== "sent" && "invisible"
                  )}
                >
                  <svg
                    aria-hidden="true"
                    className="text-primary size-10"
                    fill="none"
                    viewBox="0 0 40 40"
                  >
                    <circle
                      cx="20"
                      cy="20"
                      r="18"
                      className="stroke-current opacity-20"
                      strokeWidth="2"
                    />
                    <path
                      className="transition-[stroke-dashoffset] duration-300 ease-out motion-reduce:transition-none"
                      d="M13 20.5 18 25.5 27.5 15"
                      stroke="currentColor"
                      strokeDasharray={CHECK_LENGTH}
                      strokeDashoffset={status === "sent" ? 0 : CHECK_LENGTH}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                    />
                  </svg>
                  <p className="text-sm">{sentMessage}</p>
                </div>
              </div>
            </div>
          ) : (
            <button
              ref={triggerRef}
              type="button"
              aria-haspopup="dialog"
              onClick={() => {
                setOpen(true)
                setStatus("idle")
              }}
              className="hover:bg-muted focus-visible:ring-ring inline-flex min-h-11 items-center gap-2 rounded-[1.375rem] px-4 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-inset"
            >
              <svg
                aria-hidden="true"
                className="size-4"
                fill="none"
                viewBox="0 0 16 16"
              >
                <path
                  d="M2.5 4a1.5 1.5 0 0 1 1.5-1.5h8A1.5 1.5 0 0 1 13.5 4v5.5A1.5 1.5 0 0 1 12 11H7l-3 2.5V11a1.5 1.5 0 0 1-1.5-1.5Z"
                  stroke="currentColor"
                  strokeLinejoin="round"
                  strokeWidth="1.4"
                />
              </svg>
              {triggerLabel}
            </button>
          )}
        </div>
      </div>
      <span aria-live="polite" className="sr-only">
        {announcement}
      </span>
    </div>
  )
})
