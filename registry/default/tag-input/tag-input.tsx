"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

export type TagInputProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onChange" | "defaultValue"
> & {
  value?: readonly string[]
  defaultValue?: readonly string[]
  onChange?: (tags: string[]) => void
  placeholder?: string
  /** Keys that end a tag, besides Enter. */
  separators?: readonly string[]
  max?: number
  /** Whether the same tag may be added twice. */
  allowDuplicates?: boolean
  label?: string
  disabled?: boolean
}

/**
 * An input that turns what you typed into a removable tag. Backspace on an
 * empty field takes the last one back, which is the thing people try first.
 */
export function TagInput({
  value,
  defaultValue = [],
  onChange,
  placeholder = "Add a tag",
  separators = [",", "Enter"],
  max,
  allowDuplicates = false,
  label = "Tags",
  disabled,
  className,
  ...rootProps
}: TagInputProps) {
  const [uncontrolled, setUncontrolled] = React.useState<string[]>([
    ...defaultValue,
  ])
  const [draft, setDraft] = React.useState("")
  const [message, setMessage] = React.useState("")
  const inputRef = React.useRef<HTMLInputElement>(null)
  const reactId = React.useId()

  const tags = value ? [...value] : uncontrolled
  const full = max !== undefined && tags.length >= max

  const commit = (next: string[], said: string) => {
    if (value === undefined) setUncontrolled(next)
    onChange?.(next)
    setMessage(said)
  }

  const add = (raw: string) => {
    const tag = raw.trim()
    if (tag === "" || full) return

    if (!allowDuplicates && tags.includes(tag)) {
      setMessage(`${tag} is already there`)
      setDraft("")
      return
    }

    commit([...tags, tag], `Added ${tag}`)
    setDraft("")
  }

  const remove = (index: number) => {
    const tag = tags[index]
    if (tag === undefined) return
    commit(
      tags.filter((_, position) => position !== index),
      `Removed ${tag}`
    )
  }

  return (
    <div
      data-slot="tag-input"
      className={cn(
        "border-border bg-background focus-within:border-ring focus-within:ring-ring flex min-h-11 flex-wrap items-center gap-1.5 rounded-[var(--radius)] border p-1.5 focus-within:ring-2",
        disabled && "opacity-50",
        className
      )}
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) inputRef.current?.focus()
      }}
      {...rootProps}
    >
      <span className="sr-only" id={`${reactId}-label`}>
        {label}
      </span>

      {tags.map((tag, index) => (
        <span
          key={`${tag}-${index}`}
          data-slot="tag-input-tag"
          className="bg-muted text-foreground inline-flex items-center gap-1 rounded-full py-1 pr-1 pl-2.5 text-xs font-semibold"
        >
          {tag}
          <button
            type="button"
            disabled={disabled}
            aria-label={`Remove ${tag}`}
            className="hover:bg-foreground/10 focus-visible:ring-ring inline-flex size-5 items-center justify-center rounded-full focus-visible:ring-2 focus-visible:outline-none"
            onClick={() => {
              remove(index)
              inputRef.current?.focus()
            }}
          >
            <X aria-hidden="true" size={12} />
          </button>
        </span>
      ))}

      <input
        ref={inputRef}
        data-slot="tag-input-field"
        aria-labelledby={`${reactId}-label`}
        aria-describedby={`${reactId}-status`}
        disabled={disabled || full}
        placeholder={full ? `${max} is the limit` : placeholder}
        value={draft}
        className="placeholder:text-muted-foreground min-w-32 flex-1 bg-transparent px-1.5 py-1 text-sm outline-none"
        onChange={(event) => setDraft(event.target.value)}
        onBlur={() => add(draft)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || separators.includes(event.key)) {
            event.preventDefault()
            add(draft)
            return
          }

          if (event.key === "Backspace" && draft === "" && tags.length > 0) {
            event.preventDefault()
            remove(tags.length - 1)
          }
        }}
      />

      <span
        className="sr-only"
        id={`${reactId}-status`}
        role="status"
        aria-live="polite"
      >
        {message}
      </span>
    </div>
  )
}
