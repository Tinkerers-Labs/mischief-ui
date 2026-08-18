"use client"

import * as React from "react"
import { ArrowUp, Square } from "lucide-react"
import { cn } from "@/lib/utils"

export type PromptInputStatus = "ready" | "streaming"

export type PromptInputProps = Omit<
  React.HTMLAttributes<HTMLFormElement>,
  "onSubmit" | "children"
> & {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  onSubmit?: (value: string) => void
  onStop?: () => void
  status?: PromptInputStatus
  placeholder?: string
  label?: string
  disabled?: boolean
  maxRows?: number
  attachments?: React.ReactNode
  actions?: React.ReactNode
  submitLabel?: string
  stopLabel?: string
}

const LINE_HEIGHT_FALLBACK = 20

export function PromptInput({
  value,
  defaultValue = "",
  onValueChange,
  onSubmit,
  onStop,
  status = "ready",
  placeholder = "Ask anything…",
  label = "Message",
  disabled = false,
  maxRows = 8,
  attachments,
  actions,
  submitLabel = "Send message",
  stopLabel = "Stop generating",
  className,
  ...formProps
}: PromptInputProps) {
  const fieldId = React.useId()
  const fieldRef = React.useRef<HTMLTextAreaElement>(null)
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue)

  const text = value ?? uncontrolled
  const streaming = status === "streaming"
  const canSend = text.trim().length > 0 && !disabled

  const setText = (next: string) => {
    if (value === undefined) setUncontrolled(next)
    onValueChange?.(next)
  }

  // Grow with the content up to maxRows, then scroll inside the field.
  React.useEffect(() => {
    const field = fieldRef.current
    if (!field) return

    field.style.height = "auto"

    const styles = window.getComputedStyle(field)
    const lineHeight =
      Number.parseFloat(styles.lineHeight) || LINE_HEIGHT_FALLBACK
    const padding =
      Number.parseFloat(styles.paddingTop) +
      Number.parseFloat(styles.paddingBottom)

    const max = lineHeight * maxRows + padding

    field.style.height = `${Math.min(field.scrollHeight, max)}px`
    field.style.overflowY = field.scrollHeight > max ? "auto" : "hidden"
  }, [text, maxRows])

  const submit = () => {
    if (!canSend) return
    onSubmit?.(text.trim())
    if (value === undefined) setUncontrolled("")
  }

  return (
    <form
      data-slot="prompt-input"
      data-status={status}
      className={cn(
        "border-border bg-card focus-within:ring-ring/40 rounded-[calc(var(--radius)+0.35rem)] border transition-[box-shadow,border-color] duration-150 focus-within:ring-2 motion-reduce:transition-none",
        className
      )}
      onSubmit={(event) => {
        event.preventDefault()
        submit()
      }}
      {...formProps}
    >
      {attachments ? (
        <div
          data-slot="prompt-input-attachments"
          className="border-border border-b px-3 py-2"
        >
          {attachments}
        </div>
      ) : null}

      <label className="sr-only" htmlFor={fieldId}>
        {label}
      </label>
      <textarea
        ref={fieldRef}
        id={fieldId}
        data-slot="prompt-input-field"
        rows={1}
        disabled={disabled}
        placeholder={placeholder}
        value={text}
        className="placeholder:text-muted-foreground block w-full resize-none bg-transparent px-3.5 py-3 text-sm leading-relaxed outline-none disabled:opacity-60"
        onChange={(event) => setText(event.target.value)}
        onKeyDown={(event) => {
          // Enter sends, Shift+Enter starts a new line. During composition of
          // an IME candidate Enter belongs to the IME, never to the form.
          if (event.key !== "Enter" || event.shiftKey) return
          if (event.nativeEvent.isComposing) return

          event.preventDefault()
          submit()
        }}
      />

      <div
        data-slot="prompt-input-toolbar"
        className="flex items-center gap-2 px-2 pb-2"
      >
        {actions}

        {streaming ? (
          <button
            type="button"
            data-slot="prompt-input-stop"
            aria-label={stopLabel}
            className="bg-foreground text-background focus-visible:ring-ring ml-auto inline-flex size-9 shrink-0 items-center justify-center rounded-full transition-opacity duration-150 focus-visible:ring-2 focus-visible:outline-none motion-reduce:transition-none"
            onClick={onStop}
          >
            <Square aria-hidden="true" size={13} fill="currentColor" />
          </button>
        ) : (
          <button
            type="submit"
            data-slot="prompt-input-submit"
            aria-label={submitLabel}
            disabled={!canSend}
            className="bg-foreground text-background focus-visible:ring-ring ml-auto inline-flex size-9 shrink-0 items-center justify-center rounded-full transition-opacity duration-150 focus-visible:ring-2 focus-visible:outline-none disabled:opacity-40 motion-reduce:transition-none"
          >
            <ArrowUp aria-hidden="true" size={16} />
          </button>
        )}
      </div>
    </form>
  )
}
