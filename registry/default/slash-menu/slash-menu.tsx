"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export type SlashCommand = {
  /** Typed after the slash, such as `translate`. */
  name: string
  description?: string
  /** Argument names in order. The last one takes the rest of the line. */
  args?: readonly string[]
}

export type SlashMenuProps = Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  "value" | "defaultValue" | "onChange"
> & {
  commands: readonly SlashCommand[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  onCommandSelect?: (command: SlashCommand) => void
  /** Where the menu opens. Auto picks the side with room for it. */
  side?: "auto" | "top" | "bottom"
}

export type ParsedSlashCommand = {
  command: SlashCommand
  args: string[]
}

/** Splits `/name a b c` into its command and arguments. */
export function parseSlashCommand(
  text: string,
  commands: readonly SlashCommand[]
): ParsedSlashCommand | null {
  const match = /^\s*\/([\w-]+)(?:\s+([\s\S]*))?$/.exec(text)
  if (!match) return null

  const command = commands.find((candidate) => candidate.name === match[1])
  if (!command) return null

  const rest = (match[2] ?? "").trim()
  const count = command.args?.length ?? 0
  if (!rest || count === 0) return { command, args: [] }

  const words = rest.split(/\s+/)
  const args = words.slice(0, count - 1)
  const tail = words.slice(count - 1).join(" ")
  if (tail) args.push(tail)

  return { command, args }
}

function tokenAt(text: string, caret: number) {
  const match = /(?:^|\s)\/([\w-]*)$/.exec(text.slice(0, caret))
  if (!match) return null

  const query = match[1] ?? ""
  return { start: caret - query.length - 1, query }
}

function commandBefore(
  text: string,
  caret: number,
  commands: readonly SlashCommand[]
) {
  const before = text.slice(0, caret)
  const pattern = /(^|\s)\/([\w-]+)/g
  let found: { command: SlashCommand; end: number } | null = null

  for (const match of before.matchAll(pattern)) {
    const command = commands.find((candidate) => candidate.name === match[2])
    const end = (match.index ?? 0) + match[0].length
    if (command && end < caret) found = { command, end }
  }

  if (!found) return null

  const count = found.command.args?.length ?? 0
  if (count === 0) return { command: found.command, arg: -1 }

  const segment = before.slice(found.end)
  if (!/^\s/.test(segment)) return null

  const words = segment.trim() ? segment.trim().split(/\s+/) : []
  const typing = /\S$/.test(segment)
  const index = typing ? words.length - 1 : words.length

  return { command: found.command, arg: Math.min(index, count - 1) }
}

function rank(commands: readonly SlashCommand[], query: string) {
  const needle = query.toLowerCase()
  const starts = commands.filter((command) =>
    command.name.toLowerCase().startsWith(needle)
  )
  const contains = commands.filter(
    (command) =>
      !command.name.toLowerCase().startsWith(needle) &&
      command.name.toLowerCase().includes(needle)
  )
  return [...starts, ...contains]
}

/** The tallest the menu gets: its list's max height plus padding and border. */
const MENU_ROOM = 256

const mirrored = [
  "boxSizing",
  "width",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "borderTopWidth",
  "borderRightWidth",
  "borderBottomWidth",
  "borderLeftWidth",
  "fontFamily",
  "fontSize",
  "fontWeight",
  "fontStyle",
  "letterSpacing",
  "lineHeight",
  "textTransform",
  "wordSpacing",
  "tabSize",
] as const

/** Where a character index sits inside a textarea, measured on a copy. */
function caretPoint(field: HTMLTextAreaElement, index: number) {
  const styles = window.getComputedStyle(field)
  const mirror = document.createElement("div")

  for (const property of mirrored) mirror.style[property] = styles[property]
  mirror.style.position = "absolute"
  mirror.style.visibility = "hidden"
  mirror.style.whiteSpace = "pre-wrap"
  mirror.style.overflowWrap = "break-word"
  mirror.style.top = "0"
  mirror.style.left = "-9999px"
  mirror.textContent = field.value.slice(0, index)

  const marker = document.createElement("span")
  marker.textContent = "​"
  mirror.append(marker)
  document.body.append(mirror)

  const point = {
    top: marker.offsetTop - field.scrollTop,
    left: marker.offsetLeft - field.scrollLeft,
    height: marker.offsetHeight || Number.parseFloat(styles.lineHeight) || 20,
  }

  mirror.remove()
  return point
}

function Signature({
  command,
  active = -1,
}: {
  command: SlashCommand
  active?: number
}) {
  return (
    <span className="font-[family-name:var(--font-mono),monospace]">
      <span className="text-foreground">/{command.name}</span>
      {command.args?.map((arg, index) => (
        <React.Fragment key={arg}>
          {" "}
          <span
            className={cn(
              "rounded-sm px-0.5",
              index === active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground"
            )}
            data-active={index === active ? "" : undefined}
          >
            &lt;{arg}&gt;
          </span>
        </React.Fragment>
      ))}
    </span>
  )
}

export const SlashMenu = React.forwardRef<HTMLTextAreaElement, SlashMenuProps>(
  function SlashMenu(
    {
      commands,
      value,
      defaultValue = "",
      onValueChange,
      onCommandSelect,
      side = "auto",
      className,
      onBlur,
      onClick,
      onFocus,
      onKeyDown,
      onSelect,
      "aria-describedby": describedBy,
      "aria-label": ariaLabel = "Message",
      ...fieldProps
    },
    forwardedRef
  ) {
    const id = React.useId()
    const listId = `${id}-commands`
    const hintId = `${id}-hint`
    const rootRef = React.useRef<HTMLDivElement>(null)
    const fieldRef = React.useRef<HTMLTextAreaElement | null>(null)
    const menuRef = React.useRef<HTMLDivElement>(null)
    const pendingCaret = React.useRef<number | null>(null)

    const [uncontrolled, setUncontrolled] = React.useState(defaultValue)
    const [caret, setCaret] = React.useState(defaultValue.length)
    const [focused, setFocused] = React.useState(false)
    const [dismissed, setDismissed] = React.useState<number | null>(null)
    const [highlight, setHighlight] = React.useState({ key: "", index: 0 })

    const text = value ?? uncontrolled
    const token = focused ? tokenAt(text, caret) : null
    const open = token !== null && token.start !== dismissed
    const matches = open ? rank(commands, token.query) : []
    const expanded = open && matches.length > 0

    const key = token ? `${token.start}:${token.query}` : ""
    const index =
      highlight.key === key
        ? Math.min(highlight.index, Math.max(matches.length - 1, 0))
        : 0
    const activeCommand = expanded ? matches[index] : undefined

    const context = open ? null : commandBefore(text, caret, commands)

    const setText = (next: string) => {
      if (value === undefined) setUncontrolled(next)
      onValueChange?.(next)
    }

    const setRefs = (node: HTMLTextAreaElement | null) => {
      fieldRef.current = node
      if (typeof forwardedRef === "function") forwardedRef(node)
      else if (forwardedRef) forwardedRef.current = node
    }

    React.useLayoutEffect(() => {
      const field = fieldRef.current
      const at = pendingCaret.current
      if (!field || at === null) return
      pendingCaret.current = null
      field.setSelectionRange(at, at)
    }, [text])

    const anchor = open ? token.start : null

    React.useLayoutEffect(() => {
      const root = rootRef.current
      const field = fieldRef.current
      const menu = menuRef.current
      if (anchor === null || !root || !field || !menu) return

      const point = caretPoint(field, anchor)
      const left = Math.max(
        0,
        Math.min(
          field.offsetLeft + point.left - 8,
          root.clientWidth - menu.offsetWidth
        )
      )

      const caretTop = field.getBoundingClientRect().top + point.top
      const below = window.innerHeight - (caretTop + point.height)
      const placed =
        side !== "auto"
          ? side
          : below >= MENU_ROOM || below >= caretTop
            ? "bottom"
            : "top"

      menu.dataset.side = placed
      menu.style.left = `${left}px`
      if (placed === "top") {
        menu.style.top = ""
        menu.style.bottom = `${root.clientHeight - (field.offsetTop + point.top) + 4}px`
      } else {
        menu.style.bottom = ""
        menu.style.top = `${field.offsetTop + point.top + point.height + 4}px`
      }
    }, [anchor, side, expanded])

    const activeId = activeCommand
      ? `${id}-option-${activeCommand.name}`
      : undefined

    React.useLayoutEffect(() => {
      if (!activeId) return
      document.getElementById(activeId)?.scrollIntoView?.({ block: "nearest" })
    }, [activeId])

    const pick = (command: SlashCommand) => {
      if (!token) return

      const after = text.slice(caret)
      const inserted = `/${command.name}${/^\s/.test(after) ? "" : " "}`
      const next = text.slice(0, token.start) + inserted + after
      const at = token.start + inserted.length + (/^\s/.test(after) ? 1 : 0)

      pendingCaret.current = at
      setCaret(at)
      setText(next)
      onCommandSelect?.(command)
    }

    const readCaret = (field: HTMLTextAreaElement) =>
      setCaret(field.selectionStart ?? field.value.length)

    return (
      <div
        className="relative grid gap-1.5"
        data-slot="slash-menu"
        ref={rootRef}
      >
        <textarea
          {...fieldProps}
          aria-activedescendant={activeId}
          aria-autocomplete="list"
          aria-controls={expanded ? listId : undefined}
          aria-describedby={
            [describedBy, context ? hintId : null].filter(Boolean).join(" ") ||
            undefined
          }
          aria-expanded={expanded}
          aria-label={ariaLabel}
          className={cn(
            "border-border bg-background placeholder:text-muted-foreground focus-visible:ring-ring/40 block w-full resize-none rounded-[var(--radius)] border px-3.5 py-3 text-sm leading-relaxed outline-none focus-visible:ring-2",
            className
          )}
          data-slot="slash-menu-field"
          ref={setRefs}
          role="combobox"
          value={text}
          onBlur={(event) => {
            setFocused(false)
            onBlur?.(event)
          }}
          onChange={(event) => {
            const field = event.currentTarget
            const at = field.selectionStart ?? field.value.length
            setText(field.value)
            setCaret(at)
            if (!tokenAt(field.value, at)) setDismissed(null)
          }}
          onClick={(event) => {
            readCaret(event.currentTarget)
            onClick?.(event)
          }}
          onFocus={(event) => {
            setFocused(true)
            readCaret(event.currentTarget)
            onFocus?.(event)
          }}
          onKeyDown={(event) => {
            if (open && !event.nativeEvent.isComposing) {
              if (event.key === "Escape") {
                event.preventDefault()
                event.stopPropagation()
                setDismissed(token.start)
                return
              }

              if (expanded && activeCommand) {
                const step =
                  event.key === "ArrowDown"
                    ? 1
                    : event.key === "ArrowUp"
                      ? -1
                      : 0

                if (step) {
                  event.preventDefault()
                  setHighlight({
                    key,
                    index: (index + step + matches.length) % matches.length,
                  })
                  return
                }

                if (
                  (event.key === "Tab" || event.key === "Enter") &&
                  !event.shiftKey
                ) {
                  event.preventDefault()
                  pick(activeCommand)
                  return
                }
              }
            }

            onKeyDown?.(event)
          }}
          onSelect={(event) => {
            readCaret(event.currentTarget)
            onSelect?.(event)
          }}
        />

        <div
          className={cn(
            "bg-popover text-popover-foreground border-border absolute z-50 w-72 max-w-full overflow-hidden rounded-[var(--radius)] border p-1 shadow-lg",
            !open && "hidden"
          )}
          data-slot="slash-menu-popup"
          ref={menuRef}
        >
          {expanded ? (
            <div
              aria-label="Commands"
              className="max-h-60 overflow-y-auto"
              id={listId}
              role="listbox"
            >
              {matches.map((command, position) => {
                const selected = position === index
                return (
                  <div
                    aria-selected={selected}
                    className={cn(
                      "grid cursor-default gap-0.5 rounded-[calc(var(--radius)-0.25rem)] px-2.5 py-2 text-sm",
                      selected && "bg-accent text-accent-foreground"
                    )}
                    data-slot="slash-menu-option"
                    id={`${id}-option-${command.name}`}
                    key={command.name}
                    role="option"
                    onClick={() => pick(command)}
                    onMouseDown={(event) => event.preventDefault()}
                    onMouseMove={() => {
                      if (!selected) setHighlight({ key, index: position })
                    }}
                  >
                    <Signature command={command} />
                    {command.description ? (
                      <span className="text-muted-foreground text-xs">
                        {command.description}
                      </span>
                    ) : null}
                  </div>
                )
              })}
            </div>
          ) : open ? (
            <p className="text-muted-foreground px-2.5 py-2 text-sm">
              No command matches /{token.query}
            </p>
          ) : null}
        </div>

        {context ? (
          <p
            className="text-muted-foreground flex flex-wrap items-baseline gap-x-2 px-1 text-xs"
            data-slot="slash-menu-hint"
            id={hintId}
          >
            <Signature active={context.arg} command={context.command} />
            {context.command.description ? (
              <span>{context.command.description}</span>
            ) : null}
          </p>
        ) : null}

        <span aria-live="polite" className="sr-only">
          {context && context.arg >= 0
            ? context.command.args?.[context.arg]
            : expanded
              ? `${matches.length} ${matches.length === 1 ? "command" : "commands"}`
              : ""}
        </span>
      </div>
    )
  }
)
