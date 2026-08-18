"use client"

import * as React from "react"
import { ArrowUp, Check, TriangleAlert, X } from "lucide-react"
import { cn } from "@/lib/utils"

export type ApprovalOption = {
  id: string
  label: React.ReactNode
  description?: React.ReactNode
  destructive?: boolean
}

export type ApprovalCardProps = Omit<
  React.HTMLAttributes<HTMLElement>,
  "onSubmit" | "children"
> & {
  question: React.ReactNode
  description?: React.ReactNode
  options: ApprovalOption[]
  answerId?: string
  defaultAnswerId?: string
  holdDuration?: number
  freeform?: boolean
  freeformPlaceholder?: string
  freeformLabel?: string
  dismissLabel?: string
  answeredLabel?: string
  onApprove?: (optionId: string) => void
  onFreeformSubmit?: (value: string) => void
  onDismiss?: () => void
}

const MIN_HOLD_MS = 500

function useHold(durationMs: number, onComplete: () => void) {
  const [holdingId, setHoldingId] = React.useState<string | null>(null)
  const frame = React.useRef(0)
  const [progress, setProgress] = React.useState(0)

  const complete = React.useRef(onComplete)

  React.useEffect(() => {
    complete.current = onComplete
  })

  const cancel = React.useCallback(() => {
    window.cancelAnimationFrame(frame.current)
    setHoldingId(null)
    setProgress(0)
  }, [])

  React.useEffect(() => cancel, [cancel])

  const start = React.useCallback(
    (id: string) => {
      const duration = Math.max(durationMs, MIN_HOLD_MS)
      const startedAt = performance.now()

      setHoldingId(id)

      const tick = (now: number) => {
        const ratio = Math.min((now - startedAt) / duration, 1)
        setProgress(ratio)

        if (ratio < 1) {
          frame.current = window.requestAnimationFrame(tick)
          return
        }

        setHoldingId(null)
        setProgress(0)
        complete.current()
      }

      frame.current = window.requestAnimationFrame(tick)
    },
    [durationMs]
  )

  return { holdingId, progress, start, cancel }
}

export function ApprovalCard({
  question,
  description,
  options,
  answerId,
  defaultAnswerId,
  holdDuration = 900,
  freeform = false,
  freeformPlaceholder = "Say something else…",
  freeformLabel = "Another answer",
  dismissLabel = "Dismiss",
  answeredLabel = "Answered",
  onApprove,
  onFreeformSubmit,
  onDismiss,
  className,
  ...rootProps
}: ApprovalCardProps) {
  const headingId = React.useId()
  const [uncontrolledAnswer, setUncontrolledAnswer] = React.useState(
    defaultAnswerId ?? null
  )
  const answered = answerId ?? uncontrolledAnswer
  const [note, setNote] = React.useState("")
  const [pendingId, setPendingId] = React.useState<string | null>(null)

  const approve = React.useCallback(
    (id: string) => {
      if (answerId === undefined) setUncontrolledAnswer(id)
      onApprove?.(id)
    },
    [answerId, onApprove]
  )

  const hold = useHold(holdDuration, () => {
    if (pendingId) approve(pendingId)
  })

  const chosen = options.find((option) => option.id === answered)

  if (chosen) {
    return (
      <section
        data-slot="approval-card"
        data-state="answered"
        aria-labelledby={headingId}
        className={cn(
          "border-border bg-card text-card-foreground rounded-[var(--radius)] border px-4 py-3.5",
          className
        )}
        {...rootProps}
      >
        <p id={headingId} className="text-sm font-semibold">
          {question}
        </p>

        <p
          data-slot="approval-card-answer"
          className="text-muted-foreground mt-1.5 flex items-center gap-2 text-sm"
        >
          <Check
            aria-hidden="true"
            size={15}
            className="text-accent shrink-0"
          />
          <span>
            <span className="sr-only">{answeredLabel}: </span>
            {chosen.label}
          </span>
        </p>
      </section>
    )
  }

  return (
    <section
      data-slot="approval-card"
      data-state="pending"
      aria-labelledby={headingId}
      className={cn(
        "border-border bg-card text-card-foreground rounded-[var(--radius)] border",
        className
      )}
      {...rootProps}
    >
      <div className="flex items-start gap-3 px-4 pt-3.5">
        <div className="min-w-0 flex-1">
          <p id={headingId} className="text-sm font-semibold text-pretty">
            {question}
          </p>
          {description ? (
            <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
              {description}
            </p>
          ) : null}
        </div>

        {onDismiss ? (
          <button
            type="button"
            data-slot="approval-card-dismiss"
            aria-label={dismissLabel}
            className="text-muted-foreground hover:text-foreground focus-visible:ring-ring -mt-1.5 -mr-1.5 inline-flex size-11 shrink-0 items-center justify-center rounded-full focus-visible:ring-2 focus-visible:outline-none"
            onClick={onDismiss}
          >
            <X aria-hidden="true" size={16} />
          </button>
        ) : null}
      </div>

      <div
        data-slot="approval-card-options"
        role="group"
        aria-labelledby={headingId}
        className="grid gap-1.5 px-3 py-3"
      >
        {options.map((option) => {
          const isHolding = hold.holdingId === option.id

          const holdProps = option.destructive
            ? {
                onPointerDown: (
                  event: React.PointerEvent<HTMLButtonElement>
                ) => {
                  if (event.button !== 0) return
                  event.currentTarget.setPointerCapture(event.pointerId)
                  setPendingId(option.id)
                  hold.start(option.id)
                },
                onPointerUp: hold.cancel,
                onPointerCancel: hold.cancel,
                onPointerLeave: hold.cancel,
                onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
                  if (event.detail !== 0) return
                  approve(option.id)
                },
              }
            : { onClick: () => approve(option.id) }

          return (
            <button
              key={option.id}
              type="button"
              data-slot="approval-card-option"
              data-destructive={option.destructive || undefined}
              className={cn(
                "group border-border hover:bg-muted/60 focus-visible:ring-ring relative flex min-h-11 w-full items-center gap-2.5 overflow-hidden rounded-[calc(var(--radius)-0.25rem)] border px-3 py-2 text-left text-sm focus-visible:ring-2 focus-visible:outline-none",
                option.destructive && "border-destructive/40"
              )}
              {...holdProps}
            >
              {option.destructive ? (
                <span
                  aria-hidden="true"
                  data-slot="approval-card-hold-fill"
                  className="bg-destructive/15 absolute inset-y-0 left-0 motion-reduce:hidden"
                  style={{
                    width: isHolding ? `${hold.progress * 100}%` : 0,
                  }}
                />
              ) : null}

              <span className="relative flex min-w-0 flex-1 items-center gap-2.5">
                {option.destructive ? (
                  <TriangleAlert
                    aria-hidden="true"
                    size={15}
                    className="text-destructive shrink-0"
                  />
                ) : null}

                <span className="min-w-0">
                  <span className="font-medium">{option.label}</span>
                  {option.description ? (
                    <span className="text-muted-foreground mt-0.5 block text-xs leading-relaxed">
                      {option.description}
                    </span>
                  ) : null}
                </span>
              </span>

              {option.destructive ? (
                <span className="text-muted-foreground relative shrink-0 text-xs font-semibold">
                  {isHolding ? "Keep holding" : "Hold"}
                </span>
              ) : null}
            </button>
          )
        })}
      </div>

      {freeform ? (
        <form
          data-slot="approval-card-freeform"
          className="border-border flex items-center gap-2 border-t px-3 py-2.5"
          onSubmit={(event) => {
            event.preventDefault()
            if (!note.trim()) return
            onFreeformSubmit?.(note.trim())
            setNote("")
          }}
        >
          <label className="sr-only" htmlFor={`${headingId}-note`}>
            {freeformLabel}
          </label>
          <input
            id={`${headingId}-note`}
            className="placeholder:text-muted-foreground min-h-11 min-w-0 flex-1 bg-transparent text-sm outline-none"
            placeholder={freeformPlaceholder}
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
          <button
            type="submit"
            aria-label={freeformLabel}
            disabled={!note.trim()}
            className="bg-foreground text-background focus-visible:ring-ring inline-flex size-8 shrink-0 items-center justify-center rounded-full focus-visible:ring-2 focus-visible:outline-none disabled:opacity-40"
          >
            <ArrowUp aria-hidden="true" size={15} />
          </button>
        </form>
      ) : null}
    </section>
  )
}
