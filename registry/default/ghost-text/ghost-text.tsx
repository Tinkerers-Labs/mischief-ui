"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

type FieldElement = HTMLInputElement | HTMLTextAreaElement

export type GhostTextProps = Omit<
  React.HTMLAttributes<FieldElement>,
  "children" | "defaultValue" | "onChange"
> & {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** Returns the text to append. An empty string means no suggestion. */
  getSuggestion: (text: string, signal: AbortSignal) => string | Promise<string>
  /** Milliseconds of quiet typing before a suggestion is asked for. */
  debounce?: number
  multiline?: boolean
  rows?: number
  name?: string
  placeholder?: string
  disabled?: boolean
  readOnly?: boolean
  onAccept?: (accepted: string) => void
  onSuggestionError?: (error: unknown) => void
  /** Read to screen readers as the field's description. */
  hint?: string
}

type Suggestion = { base: string; text: string }

const MIRRORED = [
  "box-sizing",
  "font-family",
  "font-size",
  "font-style",
  "font-weight",
  "letter-spacing",
  "line-height",
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left",
  "border-top-width",
  "border-right-width",
  "border-bottom-width",
  "border-left-width",
  "tab-size",
  "text-align",
  "text-indent",
  "text-transform",
  "word-spacing",
] as const

/**
 * What is still left to show once the person has typed past the point the
 * suggestion was made for. Typing a character the suggestion predicted uses it
 * up, so nothing has to be fetched or redrawn for it.
 */
function remainderOf(suggestion: Suggestion | null, text: string) {
  if (!suggestion || !text.startsWith(suggestion.base)) return ""

  const typed = text.slice(suggestion.base.length)

  return suggestion.text.startsWith(typed)
    ? suggestion.text.slice(typed.length)
    : ""
}

/** A completion that starts mid word is read with the start of that word. */
function spoken(suggestion: Suggestion) {
  const partial = /\S*$/.exec(suggestion.base)?.[0] ?? ""
  return (partial + suggestion.text).trim()
}

function firstWord(rest: string) {
  return /^\s*\S+/.exec(rest)?.[0] ?? rest
}

export const GhostText = React.forwardRef<FieldElement, GhostTextProps>(
  function GhostText(
    {
      value,
      defaultValue = "",
      onValueChange,
      getSuggestion,
      debounce = 300,
      multiline = false,
      rows = 3,
      disabled = false,
      readOnly = false,
      onAccept,
      onSuggestionError,
      hint = "When a suggestion appears, press Tab to accept it or Escape to dismiss it.",
      className,
      onBlur,
      onFocus,
      onKeyDown,
      onScroll,
      "aria-describedby": describedBy,
      ...fieldProps
    },
    forwardedRef
  ) {
    const fieldRef = React.useRef<FieldElement | null>(null)
    const mirrorRef = React.useRef<HTMLDivElement>(null)
    const caret = React.useRef<number | null>(null)
    const hintId = React.useId()

    const [uncontrolled, setUncontrolled] = React.useState(defaultValue)
    const [suggestion, setSuggestion] = React.useState<Suggestion | null>(null)
    const [dismissedAt, setDismissedAt] = React.useState<string | null>(null)
    const [focused, setFocused] = React.useState(false)
    const [atEnd, setAtEnd] = React.useState(true)

    const text = value ?? uncontrolled
    const rest = remainderOf(suggestion, text)
    const covered = rest.length > 0
    const editable = !disabled && !readOnly
    const shown = covered && focused && atEnd && editable

    const latest = React.useRef({ getSuggestion, onSuggestionError })

    React.useEffect(() => {
      latest.current = { getSuggestion, onSuggestionError }
    })

    React.useEffect(() => {
      if (!focused || !editable || covered) return
      if (text.length === 0 || text === dismissedAt) return

      const controller = new AbortController()
      const timer = window.setTimeout(async () => {
        try {
          const next = await latest.current.getSuggestion(
            text,
            controller.signal
          )
          if (controller.signal.aborted) return
          setSuggestion(next ? { base: text, text: next } : null)
        } catch (error) {
          if (controller.signal.aborted) return
          latest.current.onSuggestionError?.(error)
        }
      }, debounce)

      return () => {
        window.clearTimeout(timer)
        controller.abort()
      }
    }, [covered, debounce, dismissedAt, editable, focused, text])

    const sync = React.useCallback(() => {
      const field = fieldRef.current
      const mirror = mirrorRef.current
      if (!field || !mirror) return

      const style = window.getComputedStyle(field)
      for (const property of MIRRORED) {
        mirror.style.setProperty(property, style.getPropertyValue(property))
      }

      const borderX =
        Number.parseFloat(style.borderLeftWidth || "0") +
        Number.parseFloat(style.borderRightWidth || "0")
      const borderY =
        Number.parseFloat(style.borderTopWidth || "0") +
        Number.parseFloat(style.borderBottomWidth || "0")

      // clientWidth leaves out a textarea's scrollbar, which is what the text
      // actually wraps against.
      mirror.style.width = `${field.clientWidth + borderX}px`
      mirror.style.height = `${field.clientHeight + borderY}px`
      mirror.scrollTop = field.scrollTop
      mirror.scrollLeft = field.scrollLeft
    }, [])

    React.useLayoutEffect(() => {
      if (shown) sync()
    }, [shown, sync, text, rest])

    React.useEffect(() => {
      const field = fieldRef.current
      if (!shown || !field || typeof ResizeObserver === "undefined") return

      const observer = new ResizeObserver(sync)
      observer.observe(field)
      return () => observer.disconnect()
    }, [shown, sync])

    React.useLayoutEffect(() => {
      const field = fieldRef.current
      if (caret.current == null || !field) return

      field.setSelectionRange(caret.current, caret.current)
      caret.current = null
    }, [text])

    const setRefs = React.useCallback(
      (node: FieldElement | null) => {
        fieldRef.current = node
        if (typeof forwardedRef === "function") forwardedRef(node)
        else if (forwardedRef) forwardedRef.current = node
      },
      [forwardedRef]
    )

    const setText = (next: string) => {
      if (value === undefined) setUncontrolled(next)
      onValueChange?.(next)
    }

    const trackCaret = () => {
      const field = fieldRef.current
      if (!field) return

      setAtEnd(
        field.selectionStart === field.selectionEnd &&
          field.selectionEnd === field.value.length
      )
    }

    const accept = (part: string) => {
      const next = text + part
      caret.current = next.length
      setText(next)
      onAccept?.(part)
    }

    const handleKeyDown = (event: React.KeyboardEvent<FieldElement>) => {
      onKeyDown?.(event)
      if (event.defaultPrevented || !shown) return
      if (event.nativeEvent.isComposing) return

      const plain =
        !event.shiftKey && !event.altKey && !event.ctrlKey && !event.metaKey

      if (event.key === "Tab" && plain) {
        event.preventDefault()
        accept(rest)
      } else if (
        event.key === "ArrowRight" &&
        (event.metaKey || event.ctrlKey) &&
        !event.shiftKey &&
        !event.altKey
      ) {
        event.preventDefault()
        accept(firstWord(rest))
      } else if (event.key === "Escape") {
        // A suggestion is the innermost thing Escape can close, so the dialog
        // or menu around the field keeps its own Escape for the next press.
        event.preventDefault()
        event.stopPropagation()
        setSuggestion(null)
        setDismissedAt(text)
      }
    }

    const field = {
      ...fieldProps,
      ref: setRefs,
      value: text,
      disabled,
      readOnly,
      "aria-autocomplete": "inline" as const,
      "aria-describedby": [describedBy, hintId].filter(Boolean).join(" "),
      "data-slot": "ghost-text-field",
      className: cn(
        "border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring block w-full rounded-md border px-3 py-2 text-sm leading-relaxed focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60",
        multiline && "resize-y",
        className
      ),
      onChange: (event: React.ChangeEvent<FieldElement>) => {
        setText(event.target.value)
        trackCaret()
      },
      onSelect: trackCaret,
      onKeyUp: trackCaret,
      onPointerUp: trackCaret,
      onKeyDown: handleKeyDown,
      onFocus: (event: React.FocusEvent<FieldElement>) => {
        onFocus?.(event)
        setFocused(true)
        trackCaret()
      },
      onBlur: (event: React.FocusEvent<FieldElement>) => {
        onBlur?.(event)
        setFocused(false)
      },
      onScroll: (event: React.UIEvent<FieldElement>) => {
        onScroll?.(event)
        if (shown) sync()
      },
    }

    return (
      <div
        data-slot="ghost-text"
        data-state={shown ? "suggesting" : "idle"}
        className="relative"
      >
        {multiline ? <textarea rows={rows} {...field} /> : <input {...field} />}

        {shown ? (
          <div
            ref={mirrorRef}
            data-slot="ghost-text-mirror"
            className={cn(
              "pointer-events-none absolute top-0 left-0 overflow-hidden border-solid border-transparent transition-opacity duration-150 ease-out motion-reduce:transition-none starting:opacity-0",
              multiline ? "break-words whitespace-pre-wrap" : "whitespace-pre"
            )}
          >
            <span aria-hidden="true" className="text-transparent">
              {text}
            </span>
            <span
              aria-hidden="true"
              data-slot="ghost-text-suggestion"
              className="text-muted-foreground"
            >
              {rest}
            </span>
            {/* There is no Tab key on a touch keyboard, so the hint doubles
                as the way to take the suggestion there. */}
            <button
              type="button"
              tabIndex={-1}
              aria-label="Accept suggestion"
              onPointerDown={(event) => event.preventDefault()}
              onClick={() => accept(rest)}
              className="border-border bg-background text-muted-foreground hover:text-foreground pointer-events-auto relative ms-1.5 inline-flex h-[1.35em] items-center rounded border px-1 align-text-bottom font-sans text-[0.7em] leading-none font-medium transition-colors duration-150 after:absolute after:-inset-2 after:content-[''] motion-reduce:transition-none"
            >
              Tab
            </button>
          </div>
        ) : null}

        <span id={hintId} className="sr-only">
          {hint}
        </span>
        <span aria-live="polite" className="sr-only">
          {shown && suggestion ? `Suggestion: ${spoken(suggestion)}` : ""}
        </span>
      </div>
    )
  }
)
