"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"

export type Model = {
  id: string
  name: string
  description?: string
  /** Short capability tags, such as "vision" or "fast". */
  badges?: readonly string[]
  disabled?: boolean
}

export type ModelPickerProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onChange" | "defaultValue"
> & {
  models: readonly Model[]
  value?: string
  defaultValue?: string
  onValueChange?: (id: string) => void
  label?: string
  placeholder?: string
  disabled?: boolean
}

export function ModelPicker({
  models,
  value,
  defaultValue,
  onValueChange,
  label = "Model",
  placeholder = "Choose a model",
  disabled = false,
  className,
  ...rootProps
}: ModelPickerProps) {
  const id = React.useId()
  const [open, setOpen] = React.useState(false)
  const [ownValue, setOwnValue] = React.useState(defaultValue)
  const [active, setActive] = React.useState(0)

  const container = React.useRef<HTMLDivElement>(null)
  const trigger = React.useRef<HTMLButtonElement>(null)
  const list = React.useRef<HTMLUListElement>(null)

  const controlled = value !== undefined
  const selectedId = controlled ? value : ownValue
  const selected = models.find((model) => model.id === selectedId)

  const choosable = React.useMemo(
    () => models.filter((model) => !model.disabled),
    [models]
  )

  React.useEffect(() => {
    if (!open) return

    const onPointerDown = (event: PointerEvent) => {
      if (!container.current?.contains(event.target as Node)) setOpen(false)
    }

    document.addEventListener("pointerdown", onPointerDown)

    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [open])

  React.useEffect(() => {
    if (open) list.current?.focus()
  }, [open])

  function choose(model: Model) {
    if (model.disabled) return

    if (!controlled) setOwnValue(model.id)
    onValueChange?.(model.id)
    setOpen(false)
    trigger.current?.focus()
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Escape") {
      event.preventDefault()
      setOpen(false)
      trigger.current?.focus()
      return
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault()
      const step = event.key === "ArrowDown" ? 1 : -1
      setActive(
        (current) =>
          (current + step + choosable.length) % Math.max(1, choosable.length)
      )
      return
    }

    if (event.key === "Home" || event.key === "End") {
      event.preventDefault()
      setActive(event.key === "Home" ? 0 : choosable.length - 1)
      return
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      const model = choosable[active]
      if (model) choose(model)
    }
  }

  const activeId = choosable[active]
    ? `${id}-option-${choosable[active]!.id}`
    : undefined

  return (
    <div
      ref={container}
      data-slot="model-picker"
      className={cn("relative min-w-0", className)}
      {...rootProps}
    >
      <button
        ref={trigger}
        type="button"
        id={`${id}-trigger`}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? `${id}-list` : undefined}
        aria-label={selected ? `${label}: ${selected.name}` : label}
        className="border-border bg-card text-foreground hover:bg-muted/60 flex min-h-11 w-full items-center gap-2 rounded-[calc(var(--radius)+0.15rem)] border px-3 text-sm transition-colors duration-150 disabled:opacity-50 motion-reduce:transition-none"
        onClick={() => {
          if (open) {
            setOpen(false)
            return
          }

          const index = choosable.findIndex((model) => model.id === selectedId)
          setActive(index < 0 ? 0 : index)
          setOpen(true)
        }}
      >
        <span
          className={cn(
            "min-w-0 flex-1 truncate text-left",
            !selected && "text-muted-foreground"
          )}
        >
          {selected?.name ?? placeholder}
        </span>
        <ChevronsUpDown
          aria-hidden="true"
          size={14}
          className="text-muted-foreground shrink-0"
        />
      </button>

      {open ? (
        <ul
          ref={list}
          id={`${id}-list`}
          role="listbox"
          tabIndex={-1}
          aria-label={label}
          aria-activedescendant={activeId}
          onKeyDown={onKeyDown}
          className="border-border bg-card absolute z-50 mt-1 max-h-72 w-full overflow-auto rounded-[calc(var(--radius)+0.15rem)] border p-1 shadow-lg outline-none"
        >
          {models.map((model) => {
            const index = choosable.indexOf(model)
            const isActive = index >= 0 && index === active
            const isSelected = model.id === selectedId

            return (
              <li
                key={model.id}
                id={`${id}-option-${model.id}`}
                role="option"
                aria-selected={isSelected}
                aria-disabled={model.disabled || undefined}
                data-active={isActive || undefined}
                className={cn(
                  "flex min-h-11 cursor-pointer items-start gap-2 rounded-md px-2.5 py-2",
                  model.disabled && "cursor-not-allowed opacity-50",
                  isActive && !model.disabled && "bg-muted"
                )}
                onPointerEnter={() => index >= 0 && setActive(index)}
                onClick={() => choose(model)}
              >
                <Check
                  aria-hidden="true"
                  size={14}
                  className={cn(
                    "mt-1 shrink-0",
                    isSelected ? "text-primary" : "invisible"
                  )}
                />

                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-1.5">
                    <span className="text-foreground text-sm">
                      {model.name}
                    </span>
                    {model.badges?.map((badge) => (
                      <span
                        key={badge}
                        className="border-border text-muted-foreground rounded-full border px-1.5 py-px text-[0.625rem] leading-4"
                      >
                        {badge}
                      </span>
                    ))}
                  </span>
                  {model.description ? (
                    <span className="text-muted-foreground mt-0.5 block text-xs leading-snug">
                      {model.description}
                    </span>
                  ) : null}
                </span>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}
