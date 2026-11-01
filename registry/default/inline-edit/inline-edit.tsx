"use client"

import * as React from "react"
import { ArrowUp } from "lucide-react"

import { cn } from "@/lib/utils"

export type InlineEditSelection = { start: number; end: number; text: string }

export type InlineEditRequest = {
  selection: InlineEditSelection
  instruction: string
  signal: AbortSignal
}

export type InlineEditResult =
  AsyncIterable<string> | ReadableStream<string> | Promise<string> | string

export type InlineEditPhase =
  "idle" | "prompting" | "streaming" | "review" | "error"

export type InlineEditProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children" | "defaultValue" | "onChange"
> & {
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  /** Return the replacement whole, or stream it in chunks. */
  onRequestEdit: (request: InlineEditRequest) => InlineEditResult
  /** Blocks typing. Selecting and editing through a request still work. */
  readOnly?: boolean
  label?: string
  placeholder?: string
  errorMessage?: string
  /** Shown when the selected text changed before the edit was accepted. */
  changedMessage?: string
}

type Edit = {
  before: string
  original: string
  after: string
  instruction: string
  replacement: string
}

/**
 * The same edit, cut against the text as it is now. The original keeps its
 * offsets when it can, and otherwise moves to its nearest occurrence. Null
 * when the selected text is gone.
 */
function rebase(edit: Edit, text: string): Edit | null {
  const was = edit.before.length
  let at =
    text.slice(was, was + edit.original.length) === edit.original ? was : -1

  for (
    let found = at === -1 ? text.indexOf(edit.original) : -1;
    found !== -1;
    found = text.indexOf(edit.original, found + 1)
  ) {
    if (at === -1 || Math.abs(found - was) < Math.abs(at - was)) at = found
  }

  if (at === -1) return null

  return {
    ...edit,
    before: text.slice(0, at),
    after: text.slice(at + edit.original.length),
  }
}

function isReadableStream(
  result: InlineEditResult
): result is ReadableStream<string> {
  return typeof (result as ReadableStream<string>).getReader === "function"
}

function isAsyncIterable(
  result: InlineEditResult
): result is AsyncIterable<string> {
  return typeof result === "object" && Symbol.asyncIterator in result
}

async function* chunksOf(stream: ReadableStream<string>) {
  const reader = stream.getReader()

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

const subscribeNever = () => () => {}

const surface =
  "border-input bg-background block w-full rounded-md border px-3 py-2.5 text-sm leading-relaxed break-words whitespace-pre-wrap"

const action =
  "focus-visible:ring-ring inline-flex min-h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none motion-reduce:transition-none"

function Key({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="border-border text-muted-foreground rounded border px-1 font-sans text-[0.65rem] leading-4 font-medium">
      {children}
    </kbd>
  )
}

export function InlineEdit({
  value,
  defaultValue = "",
  onChange,
  onRequestEdit,
  readOnly = false,
  label = "Document",
  placeholder = "Rewrite…",
  errorMessage = "The rewrite did not come through.",
  changedMessage = "The document changed under this edit.",
  className,
  ...rootProps
}: InlineEditProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const fieldRef = React.useRef<HTMLTextAreaElement>(null)
  const viewRef = React.useRef<HTMLDivElement>(null)
  const floatingRef = React.useRef<HTMLDivElement>(null)
  const controller = React.useRef<AbortController | null>(null)
  const restore = React.useRef<{ start: number; end: number } | null>(null)
  const hintId = React.useId()

  const [uncontrolled, setUncontrolled] = React.useState(defaultValue)
  const [selection, setSelection] = React.useState({ start: 0, end: 0 })
  const [focusWithin, setFocusWithin] = React.useState(false)
  const [phase, setPhase] = React.useState<InlineEditPhase>("idle")
  const [edit, setEdit] = React.useState<Edit | null>(null)
  const [instruction, setInstruction] = React.useState("")
  const [announcement, setAnnouncement] = React.useState("")

  const isMac = React.useSyncExternalStore(
    subscribeNever,
    () => /Mac|iPhone|iPad/.test(navigator.platform),
    () => false
  )

  const text = value ?? uncontrolled
  const idle = phase === "idle"
  const hasSelection = selection.end > selection.start
  const offerEdit = idle && focusWithin && hasSelection

  // Accept only writes where the original still sits at the offsets it was
  // selected from. Anything else would overwrite what the host changed.
  const current = edit && !idle ? rebase(edit, text) : null
  const inPlace =
    current && edit && current.before.length === edit.before.length
      ? current
      : null
  const stale = phase === "review" && inPlace == null

  const setText = (next: string) => {
    if (value === undefined) setUncontrolled(next)
    onChange?.(next)
  }

  React.useEffect(() => () => controller.current?.abort(), [])

  React.useLayoutEffect(() => {
    const field = fieldRef.current
    if (!idle || !field) return

    field.style.height = "auto"
    field.style.height = `${field.scrollHeight}px`
  }, [idle, text])

  React.useLayoutEffect(() => {
    const field = fieldRef.current
    if (!idle || !field || !restore.current) return

    const { start, end } = restore.current
    restore.current = null
    field.focus()
    field.setSelectionRange(start, end)
  }, [idle])

  React.useLayoutEffect(() => {
    const floating = floatingRef.current
    const root = rootRef.current
    const anchor = viewRef.current?.querySelector("[data-anchor]")
    if (!floating || !root || !anchor) return

    const rects = anchor.getClientRects()
    const end = rects[rects.length - 1] ?? anchor.getBoundingClientRect()
    const box = root.getBoundingClientRect()

    floating.style.top = `${end.bottom - box.top + 6}px`
    floating.style.left = `${Math.max(
      0,
      Math.min(end.left - box.left, box.width - floating.offsetWidth)
    )}px`
  })

  React.useLayoutEffect(() => {
    const floating = floatingRef.current
    if (!floating) return

    if (phase === "review" && !stale) {
      floating
        .querySelector<HTMLElement>('[data-slot="inline-edit-accept"]')
        ?.focus()
    } else if (phase !== "idle" && phase !== "prompting") {
      floating.focus()
    }
  }, [phase, stale])

  React.useEffect(() => {
    if (phase !== "prompting") return

    const dismiss = (event: PointerEvent) => {
      if (rootRef.current?.contains(event.target as Node)) return
      setPhase("idle")
      setEdit(null)
    }

    document.addEventListener("pointerdown", dismiss)
    return () => document.removeEventListener("pointerdown", dismiss)
  }, [phase])

  const trackSelection = () => {
    const field = fieldRef.current
    if (!field) return
    setSelection({ start: field.selectionStart, end: field.selectionEnd })
  }

  const openPrompt = () => {
    if (!hasSelection) return

    const { start, end } = selection
    setEdit({
      before: text.slice(0, start),
      original: text.slice(start, end),
      after: text.slice(end),
      instruction: "",
      replacement: "",
    })
    setInstruction("")
    setPhase("prompting")
  }

  const run = async (current: Edit, ask: string) => {
    controller.current?.abort()
    const own = new AbortController()
    controller.current = own

    setEdit({ ...current, instruction: ask, replacement: "" })
    setPhase("streaming")
    setAnnouncement("Rewriting the selection.")

    const start = current.before.length

    try {
      const result = onRequestEdit({
        selection: {
          start,
          end: start + current.original.length,
          text: current.original,
        },
        instruction: ask,
        signal: own.signal,
      })

      let full = ""

      if (typeof result === "string") {
        full = result
      } else if (isReadableStream(result) || isAsyncIterable(result)) {
        const chunks = isReadableStream(result) ? chunksOf(result) : result
        for await (const chunk of chunks) {
          if (own.signal.aborted) return
          full += chunk
          setEdit((edit) => edit && { ...edit, replacement: full })
        }
      } else {
        full = await result
      }

      if (own.signal.aborted) return

      setEdit((edit) => edit && { ...edit, replacement: full })
      setPhase("review")
      setAnnouncement(
        `Suggested replacement: ${full || "remove the selection"}. Press Enter to accept or Escape to reject.`
      )
    } catch {
      if (own.signal.aborted) return
      setPhase("error")
      setAnnouncement(errorMessage)
    }
  }

  const finish = (keep: boolean) => {
    if (keep && !inPlace) return

    controller.current?.abort()
    controller.current = null

    if (!edit) {
      setPhase("idle")
      return
    }

    const start = edit.before.length

    if (keep && inPlace) {
      setText(inPlace.before + edit.replacement + inPlace.after)
      restore.current = { start, end: start + edit.replacement.length }
      setAnnouncement("Edit accepted.")
    } else {
      const at = current?.before.length ?? start
      restore.current = { start: at, end: at + edit.original.length }
      if (phase !== "prompting") setAnnouncement("Edit rejected.")
    }

    setSelection(restore.current)
    setEdit(null)
    setPhase("idle")
  }

  const handleFloatingKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === "Escape") {
      event.preventDefault()
      event.stopPropagation()
      finish(false)
      return
    }

    if (event.key !== "Enter" || phase !== "review") return

    // A plain Enter on Reject is Reject's own click. Cmd or Ctrl+Enter
    // accepts from anywhere in the bar.
    if (
      event.metaKey ||
      event.ctrlKey ||
      event.target === event.currentTarget
    ) {
      event.preventDefault()
      finish(true)
    }
  }

  const mod = isMac ? "⌘" : "Ctrl "

  const marked = (content: React.ReactNode) => (
    <span data-anchor="">{content}</span>
  )

  let body: React.ReactNode = null

  if (idle) {
    body = (
      <>
        {text.slice(0, selection.start)}
        {marked(text.slice(selection.start, selection.end))}
        {text.slice(selection.end)}
      </>
    )
  } else if (edit) {
    const changed = phase === "streaming" || phase === "review"

    body = (
      <>
        {edit.before}
        {changed
          ? marked(
              <>
                <del className="decoration-destructive/70 text-muted-foreground me-1">
                  <span className="sr-only">Removed: </span>
                  {edit.original}
                </del>
                <ins
                  data-slot="inline-edit-replacement"
                  className="bg-primary/15 text-foreground rounded-sm no-underline"
                >
                  <span className="sr-only">Added: </span>
                  {edit.replacement}
                  {phase === "streaming" ? (
                    <span
                      aria-hidden="true"
                      className="bg-foreground ml-0.5 inline-block h-[1em] w-[0.5ch] translate-y-[0.12em] animate-pulse motion-reduce:animate-none"
                    />
                  ) : null}
                </ins>
              </>
            )
          : marked(
              <mark className="bg-primary/15 text-foreground rounded-sm">
                {edit.original}
              </mark>
            )}
        {edit.after}
      </>
    )
  }

  let floating: React.ReactNode = null

  if (offerEdit) {
    floating = (
      <button
        type="button"
        aria-keyshortcuts="Meta+K Control+K"
        onPointerDown={(event) => event.preventDefault()}
        onClick={openPrompt}
        className={cn(
          action,
          "bg-popover text-popover-foreground border-border hover:bg-muted border shadow-md"
        )}
      >
        Edit selection
        <Key>{mod}K</Key>
      </button>
    )
  }

  if (phase === "prompting" && edit) {
    floating = (
      <form
        className="bg-popover text-popover-foreground border-border focus-within:ring-ring/40 flex w-[min(22rem,100%)] items-center gap-1 rounded-lg border p-1 shadow-lg focus-within:ring-2"
        onSubmit={(event) => {
          event.preventDefault()
          if (instruction.trim()) void run(edit, instruction.trim())
        }}
      >
        <input
          autoFocus
          aria-label="How should the selection change?"
          value={instruction}
          onChange={(event) => setInstruction(event.target.value)}
          placeholder={placeholder}
          className="placeholder:text-muted-foreground min-h-8 min-w-0 flex-1 bg-transparent px-2 text-sm outline-none"
        />
        <button
          type="submit"
          aria-label="Rewrite"
          disabled={!instruction.trim()}
          className="bg-primary text-primary-foreground focus-visible:ring-ring inline-flex size-8 shrink-0 items-center justify-center rounded-md transition-opacity duration-150 focus-visible:ring-2 focus-visible:outline-none disabled:opacity-40 motion-reduce:transition-none"
        >
          <ArrowUp aria-hidden="true" className="size-4" />
        </button>
      </form>
    )
  } else if (phase === "streaming") {
    floating = (
      <>
        <span className="text-muted-foreground px-1.5 text-xs">Rewriting</span>
        <button
          type="button"
          onClick={() => finish(false)}
          className={cn(action, "hover:bg-muted")}
        >
          Stop <Key>Esc</Key>
        </button>
      </>
    )
  } else if (phase === "review" && stale && edit) {
    floating = (
      <>
        <span className="text-destructive px-1.5 text-xs">
          {changedMessage}
        </span>
        {current ? (
          <button
            type="button"
            onClick={() => void run(current, edit.instruction)}
            className={cn(action, "hover:bg-muted")}
          >
            Retry
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => finish(false)}
          className={cn(action, "hover:bg-muted")}
        >
          Dismiss <Key>Esc</Key>
        </button>
      </>
    )
  } else if (phase === "review") {
    floating = (
      <>
        <button
          type="button"
          data-slot="inline-edit-accept"
          onClick={() => finish(true)}
          className={cn(action, "bg-primary text-primary-foreground")}
        >
          Accept
          <kbd className="font-sans text-[0.65rem] opacity-80">
            {isMac ? "⌘⏎" : "Ctrl Enter"}
          </kbd>
        </button>
        <button
          type="button"
          onClick={() => finish(false)}
          className={cn(action, "hover:bg-muted")}
        >
          Reject <Key>Esc</Key>
        </button>
      </>
    )
  } else if (phase === "error" && edit) {
    floating = (
      <>
        <span className="text-destructive px-1.5 text-xs">{errorMessage}</span>
        <button
          type="button"
          onClick={() => void run(current ?? edit, edit.instruction)}
          className={cn(action, "hover:bg-muted")}
        >
          Try again
        </button>
        <button
          type="button"
          onClick={() => finish(false)}
          className={cn(action, "hover:bg-muted")}
        >
          Dismiss
        </button>
      </>
    )
  }

  const toolbar =
    phase === "streaming" || phase === "review" || phase === "error"

  return (
    <div
      ref={rootRef}
      data-slot="inline-edit"
      data-phase={phase}
      className={cn("relative", className)}
      onFocus={() => setFocusWithin(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setFocusWithin(false)
        }
      }}
      {...rootProps}
    >
      <textarea
        ref={fieldRef}
        aria-label={label}
        aria-describedby={hintId}
        aria-keyshortcuts="Meta+K Control+K"
        data-slot="inline-edit-field"
        readOnly={readOnly}
        rows={1}
        value={text}
        hidden={!idle}
        onChange={(event) => {
          setText(event.target.value)
          trackSelection()
        }}
        onSelect={trackSelection}
        onKeyUp={trackSelection}
        onPointerUp={trackSelection}
        onKeyDown={(event) => {
          if (
            event.key.toLowerCase() === "k" &&
            (event.metaKey || event.ctrlKey) &&
            !event.altKey &&
            !event.shiftKey
          ) {
            event.preventDefault()
            trackSelection()
            const field = event.currentTarget
            if (field.selectionEnd > field.selectionStart) openPrompt()
          }
        }}
        className={cn(
          surface,
          "focus-visible:ring-ring resize-none overflow-hidden focus-visible:ring-2 focus-visible:outline-none"
        )}
      />

      <div
        ref={viewRef}
        aria-hidden={idle || undefined}
        data-slot="inline-edit-view"
        className={cn(
          surface,
          idle && "pointer-events-none invisible absolute inset-x-0 top-0"
        )}
      >
        {body}
        {"​"}
      </div>

      {floating ? (
        <div
          key={phase}
          ref={floatingRef}
          role={toolbar ? "toolbar" : undefined}
          aria-label={toolbar ? "Review the edit" : undefined}
          tabIndex={toolbar ? -1 : undefined}
          onKeyDown={handleFloatingKeyDown}
          data-slot="inline-edit-floating"
          className={cn(
            "absolute top-0 left-0 z-20 transition-[opacity,translate] duration-150 ease-out focus-visible:outline-none motion-reduce:transition-none starting:translate-y-1 starting:opacity-0",
            toolbar &&
              "bg-popover text-popover-foreground border-border flex items-center gap-1 rounded-lg border p-1 shadow-lg"
          )}
        >
          {floating}
        </div>
      ) : null}

      <span id={hintId} className="sr-only">
        Select text, then press {isMac ? "Command" : "Control"} K to rewrite it.
      </span>
      <span aria-live="polite" className="sr-only">
        {stale ? changedMessage : announcement}
      </span>
    </div>
  )
}
