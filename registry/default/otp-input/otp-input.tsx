"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type OtpInputProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onChange" | "defaultValue"
> & {
  length?: number
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  /** Called once the last box is filled. */
  onComplete?: (value: string) => void
  /** Which characters are allowed. Digits only by default. */
  pattern?: RegExp
  label?: string
  disabled?: boolean
  autoFocus?: boolean
}

const DIGITS = /^[0-9]$/

/**
 * A one time code, one box per character. Pasting the whole code into any box
 * fills the rest, which is what people do with the code their phone just
 * showed them.
 */
export function OtpInput({
  length = 6,
  value,
  defaultValue = "",
  onChange,
  onComplete,
  pattern = DIGITS,
  label = "One time code",
  disabled,
  autoFocus,
  className,
  ...rootProps
}: OtpInputProps) {
  const boxes = React.useRef<(HTMLInputElement | null)[]>([])
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue)
  const current = (value ?? uncontrolled).slice(0, length)
  const completed = React.useRef(false)

  const commit = (next: string) => {
    if (value === undefined) setUncontrolled(next)
    onChange?.(next)

    if (next.length === length && !completed.current) {
      completed.current = true
      onComplete?.(next)
    }

    if (next.length < length) completed.current = false
  }

  const focusBox = (index: number) => {
    const box = boxes.current[Math.min(Math.max(index, 0), length - 1)]
    box?.focus()
    box?.select()
  }

  const write = (index: number, characters: string) => {
    const allowed = Array.from(characters).filter((character) =>
      pattern.test(character)
    )

    if (allowed.length === 0) return

    const filled = current.padEnd(length, " ").split("")
    allowed.forEach((character, offset) => {
      if (index + offset < length) filled[index + offset] = character
    })

    commit(filled.join("").trimEnd())
    focusBox(index + allowed.length)
  }

  return (
    <div
      role="group"
      aria-label={label}
      data-slot="otp-input"
      className={cn("flex items-center gap-2", className)}
      {...rootProps}
    >
      {Array.from({ length }, (_, index) => {
        const character = current[index] ?? ""

        return (
          <input
            key={index}
            ref={(node) => {
              boxes.current[index] = node
            }}
            data-slot="otp-input-box"
            data-filled={character ? "" : undefined}
            inputMode={pattern === DIGITS ? "numeric" : "text"}
            autoComplete={index === 0 ? "one-time-code" : "off"}
            autoFocus={autoFocus && index === 0}
            disabled={disabled}
            aria-label={`${label}, character ${index + 1} of ${length}`}
            value={character}
            className={cn(
              "border-border bg-background focus-visible:border-ring focus-visible:ring-ring size-12 rounded-[calc(var(--radius)-0.25rem)] border text-center text-lg font-semibold",
              "transition-[transform,border-color] duration-150 focus-visible:ring-2 focus-visible:outline-none motion-reduce:transition-none",
              "data-filled:border-foreground disabled:opacity-50 data-filled:scale-105"
            )}
            onChange={(event) => {
              const typed = event.target.value.replace(character, "")
              write(index, typed || event.target.value)
            }}
            onPaste={(event) => {
              event.preventDefault()
              write(index, event.clipboardData.getData("text"))
            }}
            onKeyDown={(event) => {
              if (event.key === "Backspace") {
                event.preventDefault()
                const filled = current.split("")

                if (filled[index]) {
                  filled[index] = ""
                  commit(filled.join("").trimEnd())
                } else {
                  filled[index - 1] = ""
                  commit(filled.join("").trimEnd())
                  focusBox(index - 1)
                }
              }

              if (event.key === "ArrowLeft") {
                event.preventDefault()
                focusBox(index - 1)
              }

              if (event.key === "ArrowRight") {
                event.preventDefault()
                focusBox(index + 1)
              }
            }}
          />
        )
      })}
    </div>
  )
}
