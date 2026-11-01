"use client"

import * as React from "react"
import { Ban, Check, ChevronRight, Loader, ShieldCheck } from "lucide-react"

import { cn } from "@/lib/utils"

export type ToolApprovalDecision = "allow-once" | "allow-always" | "deny"

export type ToolApprovalProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children" | "input"
> & {
  /** The tool the agent wants to run, such as `delete_branch`. */
  name: string
  /** The raw arguments. A plain object is also listed key by key. */
  input?: unknown
  /** A sentence that says what the call will do, in place of the key list. */
  summary?: React.ReactNode
  /** Allowing then takes a press and hold, or a second confirmation. */
  destructive?: boolean
  /** May return a promise. A rejection puts the choices back. */
  onDecision: (decision: ToolApprovalDecision) => void | Promise<void>
  /** A decision made earlier, for a card restored from history. */
  decision?: ToolApprovalDecision | null
  /** Offer Always allow. Defaults to true. */
  allowAlways?: boolean
  /** How long a destructive allow is held, in milliseconds. */
  holdDuration?: number
}

const resolvedText: Record<ToolApprovalDecision, string> = {
  "allow-once": "Allowed once",
  "allow-always": "Always allowed",
  deny: "Denied",
}

const actionText: Record<ToolApprovalDecision, string> = {
  "allow-once": "Allow once",
  "allow-always": "Always allow",
  deny: "Deny",
}

function formatValue(value: unknown) {
  if (typeof value === "string") return value

  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

function formatRaw(value: unknown) {
  if (typeof value === "string") return value

  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

function entriesOf(value: unknown) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return null
  }

  return Object.entries(value as Record<string, unknown>)
}

const buttonBase =
  "focus-visible:ring-ring relative isolate inline-flex min-h-10 items-center justify-center gap-1.5 overflow-hidden rounded-full px-4 text-sm font-medium select-none focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-60 motion-safe:transition-[background-color,color,transform] motion-safe:duration-150"

type HoldPhase = "idle" | "holding" | "armed"

type DecisionButtonProps = {
  decision: ToolApprovalDecision
  hold: boolean
  holdDuration: number
  pending: boolean
  disabled: boolean
  className: string
  describedBy?: string
  onChoose: (decision: ToolApprovalDecision) => void
  onPhaseChange: (phase: HoldPhase) => void
}

function DecisionButton({
  decision,
  hold,
  holdDuration,
  pending,
  disabled,
  className,
  describedBy,
  onChoose,
  onPhaseChange,
}: DecisionButtonProps) {
  const [phase, setPhase] = React.useState<HoldPhase>("idle")
  const [progress, setProgress] = React.useState(0)
  const phaseRef = React.useRef<HoldPhase>("idle")
  const frame = React.useRef<number | null>(null)
  const armTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const heldKey = React.useRef<string | null>(null)
  const keyReleasedAt = React.useRef(-Infinity)

  const move = React.useCallback(
    (next: HoldPhase) => {
      phaseRef.current = next
      setPhase(next)
      onPhaseChange(next)
    },
    [onPhaseChange]
  )

  const stopFrame = () => {
    if (frame.current !== null) cancelAnimationFrame(frame.current)
    frame.current = null
  }

  React.useEffect(
    () => () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current)
      if (armTimer.current) clearTimeout(armTimer.current)
    },
    []
  )

  const complete = () => {
    stopFrame()
    if (armTimer.current) clearTimeout(armTimer.current)
    setProgress(0)
    move("idle")
    onChoose(decision)
  }

  const begin = () => {
    if (disabled || phaseRef.current === "holding") return
    if (armTimer.current) clearTimeout(armTimer.current)

    const length = Math.max(holdDuration, 500)
    const startedAt = performance.now()
    move("holding")

    const tick = (now: number) => {
      const next = Math.min((now - startedAt) / length, 1)
      setProgress(next)
      if (next >= 1) {
        complete()
        return
      }
      frame.current = requestAnimationFrame(tick)
    }

    frame.current = requestAnimationFrame(tick)
  }

  const cancel = () => {
    if (phaseRef.current !== "holding") return
    stopFrame()
    setProgress(0)
    move("idle")
  }

  const arm = () => {
    move("armed")
    armTimer.current = setTimeout(() => move("idle"), 5000)
  }

  const label =
    phase === "holding"
      ? "Keep holding"
      : phase === "armed"
        ? "Press again to allow"
        : actionText[decision]

  return (
    <button
      aria-busy={pending || undefined}
      aria-describedby={hold ? describedBy : undefined}
      className={cn(
        buttonBase,
        hold && "cursor-default touch-none [-webkit-touch-callout:none]",
        phase === "holding" && "motion-safe:scale-[0.98]",
        className
      )}
      data-decision={decision}
      data-hold={hold ? "" : undefined}
      data-state={phase}
      disabled={disabled}
      type="button"
      onBlur={cancel}
      onClick={(event) => {
        if (!hold) {
          onChoose(decision)
          return
        }
        // A click with no pointer and no held key behind it comes from
        // assistive technology that activates directly, so it confirms in two
        // steps. Space releases its own click right after keyup.
        if (event.detail !== 0) return
        if (heldKey.current) return
        if (performance.now() - keyReleasedAt.current < 400) return
        if (phaseRef.current === "armed") complete()
        else arm()
      }}
      onKeyDown={(event) => {
        if (!hold) return
        if (event.key !== "Enter" && event.key !== " ") return
        event.preventDefault()
        if (event.repeat || heldKey.current) return
        heldKey.current = event.key
        begin()
      }}
      onKeyUp={(event) => {
        if (!hold || event.key !== heldKey.current) return
        event.preventDefault()
        heldKey.current = null
        keyReleasedAt.current = performance.now()
        cancel()
      }}
      onContextMenu={(event) => {
        if (hold) event.preventDefault()
      }}
      onLostPointerCapture={cancel}
      onPointerCancel={cancel}
      onPointerDown={(event) => {
        if (!hold || event.button !== 0) return
        event.currentTarget.setPointerCapture(event.pointerId)
        begin()
      }}
      onPointerUp={cancel}
    >
      {hold ? (
        <span
          aria-hidden="true"
          className="bg-foreground/20 absolute inset-0 -z-10 origin-left"
          style={{ transform: `scaleX(${progress})` }}
        />
      ) : null}
      {pending ? (
        <Loader
          aria-hidden="true"
          className="animate-spin motion-reduce:animate-none"
          size={14}
        />
      ) : null}
      <span>{label}</span>
    </button>
  )
}

export function ToolApproval({
  name,
  input,
  summary,
  destructive = false,
  onDecision,
  decision,
  allowAlways = true,
  holdDuration = 1200,
  className,
  ...rootProps
}: ToolApprovalProps) {
  const id = React.useId()
  const titleId = `${id}-title`
  const summaryId = `${id}-summary`
  const rawId = `${id}-raw`
  const holdHintId = `${id}-hold`

  const [chosen, setChosen] = React.useState<ToolApprovalDecision | null>(null)
  const [status, setStatus] = React.useState<"idle" | "pending" | "failed">(
    "idle"
  )
  const [rawOpen, setRawOpen] = React.useState(false)
  const [notice, setNotice] = React.useState("")
  const resolvedRef = React.useRef<HTMLParagraphElement>(null)
  const focusResolved = React.useRef(false)

  const resolved = decision ?? (status === "idle" ? chosen : null)
  const pending = status === "pending"

  React.useLayoutEffect(() => {
    if (resolved && focusResolved.current) {
      focusResolved.current = false
      resolvedRef.current?.focus()
    }
  }, [resolved])

  const choose = async (next: ToolApprovalDecision) => {
    if (pending || resolved) return
    setChosen(next)
    setStatus("pending")
    setNotice("")

    try {
      await onDecision(next)
      focusResolved.current = true
      setStatus("idle")
    } catch {
      setChosen(null)
      setStatus("failed")
    }
  }

  const onPhaseChange = React.useCallback(
    (phase: HoldPhase) => {
      setNotice(
        phase === "holding"
          ? "Keep holding to allow"
          : phase === "armed"
            ? `${name} can make changes that are hard to undo. Activate again to allow it.`
            : ""
      )
    },
    [name]
  )

  if (resolved) {
    const denied = resolved === "deny"

    return (
      <div
        className={cn(
          "text-muted-foreground flex items-center gap-2 px-1 py-1.5 text-sm",
          className
        )}
        data-decision={resolved}
        data-slot="tool-approval"
        data-state="resolved"
        {...rootProps}
      >
        {denied ? (
          <Ban aria-hidden="true" className="shrink-0" size={14} />
        ) : (
          <Check
            aria-hidden="true"
            className="text-accent shrink-0"
            size={14}
          />
        )}
        <p
          className="focus-visible:ring-ring min-w-0 truncate rounded-sm outline-none focus-visible:ring-2"
          ref={resolvedRef}
          role="status"
          tabIndex={-1}
        >
          <span className="text-foreground">{resolvedText[resolved]}</span>{" "}
          <span className="font-[family-name:var(--font-mono),monospace]">
            {name}
          </span>
        </p>
      </div>
    )
  }

  const entries = summary === undefined ? entriesOf(input) : null
  const hasRaw = input !== undefined
  const disabled = pending

  return (
    <div
      aria-busy={pending || undefined}
      aria-describedby={
        summary !== undefined || entries ? summaryId : undefined
      }
      aria-labelledby={titleId}
      className={cn(
        "border-border bg-card text-card-foreground rounded-[var(--radius)] border",
        destructive && "border-destructive/40",
        className
      )}
      data-destructive={destructive ? "" : undefined}
      data-slot="tool-approval"
      data-state={pending ? "pending" : "open"}
      role="group"
      {...rootProps}
    >
      <div className="flex items-start gap-2.5 px-3.5 pt-3">
        <ShieldCheck
          aria-hidden="true"
          className={cn(
            "mt-0.5 shrink-0",
            destructive ? "text-destructive" : "text-muted-foreground"
          )}
          size={16}
        />
        <div className="min-w-0">
          <p className="text-sm" id={titleId}>
            Allow{" "}
            <span className="font-[family-name:var(--font-mono),monospace] font-semibold break-all">
              {name}
            </span>{" "}
            to run?
          </p>
          {destructive ? (
            <p className="text-destructive mt-0.5 text-xs">
              This can make changes that are hard to undo.
            </p>
          ) : null}
        </div>
      </div>

      {summary !== undefined ? (
        <div className="px-3.5 pt-2 pl-[2.375rem] text-sm" id={summaryId}>
          {summary}
        </div>
      ) : entries && entries.length > 0 ? (
        <dl
          className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 px-3.5 pt-2 pl-[2.375rem] text-xs"
          id={summaryId}
        >
          {entries.map(([key, value]) => (
            <React.Fragment key={key}>
              <dt className="text-muted-foreground">{key}</dt>
              <dd className="truncate font-[family-name:var(--font-mono),monospace]">
                {formatValue(value)}
              </dd>
            </React.Fragment>
          ))}
        </dl>
      ) : null}

      {hasRaw ? (
        <div className="px-3.5 pt-1 pl-[1.875rem]">
          <button
            aria-controls={rawId}
            aria-expanded={rawOpen}
            className="text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-flex min-h-8 items-center gap-1 rounded-full px-2 text-xs font-medium focus-visible:ring-2 focus-visible:outline-none"
            type="button"
            onClick={() => setRawOpen((open) => !open)}
          >
            <ChevronRight
              aria-hidden="true"
              className={cn(
                "transition-transform duration-200 motion-reduce:transition-none",
                rawOpen && "rotate-90"
              )}
              size={13}
            />
            Raw input
          </button>
          <pre
            className="bg-muted/60 mt-1 mb-1 max-h-48 overflow-auto rounded-[calc(var(--radius)-0.25rem)] p-2.5 font-[family-name:var(--font-mono),monospace] text-xs leading-relaxed"
            hidden={!rawOpen}
            id={rawId}
          >
            {formatRaw(input)}
          </pre>
        </div>
      ) : null}

      {status === "failed" ? (
        <p className="text-destructive px-3.5 pt-2 text-xs" role="alert">
          Your choice did not go through. Choose again.
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-end gap-2 px-3 pt-3 pb-3">
        <DecisionButton
          className="text-muted-foreground hover:text-foreground hover:bg-muted mr-auto"
          decision="deny"
          disabled={disabled}
          hold={false}
          holdDuration={holdDuration}
          pending={pending && chosen === "deny"}
          onChoose={choose}
          onPhaseChange={onPhaseChange}
        />
        {allowAlways ? (
          <DecisionButton
            className="border-border hover:bg-muted border"
            decision="allow-always"
            disabled={disabled}
            describedBy={holdHintId}
            hold={destructive}
            holdDuration={holdDuration}
            pending={pending && chosen === "allow-always"}
            onChoose={choose}
            onPhaseChange={onPhaseChange}
          />
        ) : null}
        <DecisionButton
          className={
            destructive
              ? "bg-destructive text-destructive-foreground"
              : "bg-primary text-primary-foreground"
          }
          decision="allow-once"
          disabled={disabled}
          describedBy={holdHintId}
          hold={destructive}
          holdDuration={holdDuration}
          pending={pending && chosen === "allow-once"}
          onChoose={choose}
          onPhaseChange={onPhaseChange}
        />
      </div>

      {destructive ? (
        <p
          className="text-muted-foreground px-3.5 pb-3 text-right text-xs"
          id={holdHintId}
        >
          Press and hold to allow. With a keyboard, hold Enter or Space.
        </p>
      ) : null}

      <span aria-live="polite" className="sr-only">
        {notice}
      </span>
    </div>
  )
}
