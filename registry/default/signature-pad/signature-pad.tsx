"use client"

import * as React from "react"
import { Eraser, PenLine, Type } from "lucide-react"
import { cn } from "@/lib/utils"

export type SignatureMode = "draw" | "type"

export type SignatureValue = {
  mode: SignatureMode
  dataUrl?: string
  text?: string
}

export type SignaturePadProps = Omit<
  React.HTMLAttributes<HTMLElement>,
  "children" | "onChange"
> & {
  mode?: SignatureMode
  defaultMode?: SignatureMode
  onModeChange?: (mode: SignatureMode) => void
  onChange?: (value: SignatureValue | null) => void
  penColor?: string
  lineWidth?: number
  height?: number
  label?: string
  hint?: React.ReactNode
  clearLabel?: string
  typedPlaceholder?: string
  typedFontFamily?: string
}

export function SignaturePad({
  mode,
  defaultMode = "draw",
  onModeChange,
  onChange,
  penColor = "currentColor",
  lineWidth = 2.25,
  height = 180,
  label = "Signature",
  hint = "Draw with a pointer, or switch to typing.",
  clearLabel = "Clear",
  typedPlaceholder = "Type your name",
  typedFontFamily = "var(--font-display), cursive",
  className,
  ...rootProps
}: SignaturePadProps) {
  const reactId = React.useId()
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const drawing = React.useRef(false)
  const [hasInk, setHasInk] = React.useState(false)
  const [typed, setTyped] = React.useState("")

  const [uncontrolledMode, setUncontrolledMode] =
    React.useState<SignatureMode>(defaultMode)
  const activeMode = mode ?? uncontrolledMode

  const emit = React.useRef(onChange)

  React.useEffect(() => {
    emit.current = onChange
  })

  const setMode = (next: SignatureMode) => {
    if (mode === undefined) setUncontrolledMode(next)
    onModeChange?.(next)
  }

  const context = () => {
    const canvas = canvasRef.current
    if (!canvas) return null

    const ctx = canvas.getContext("2d")
    if (!ctx) return null

    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.lineWidth = lineWidth
    ctx.strokeStyle =
      penColor === "currentColor" ? getComputedStyle(canvas).color : penColor

    return ctx
  }

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resize = () => {
      const ratio = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      if (rect.width === 0) return

      canvas.width = rect.width * ratio
      canvas.height = rect.height * ratio

      const ctx = canvas.getContext("2d")
      ctx?.scale(ratio, ratio)
      setHasInk(false)
    }

    resize()

    const observer = new ResizeObserver(resize)
    observer.observe(canvas)

    return () => observer.disconnect()
  }, [])

  const pointFrom = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    return { x: event.clientX - rect.left, y: event.clientY - rect.top }
  }

  const clear = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")

    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }

    setHasInk(false)
    setTyped("")
    emit.current?.(null)
  }

  const commitDrawing = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    emit.current?.({ mode: "draw", dataUrl: canvas.toDataURL("image/png") })
  }

  const isEmpty = activeMode === "draw" ? !hasInk : typed.trim().length === 0

  return (
    <section
      data-slot="signature-pad"
      data-mode={activeMode}
      aria-labelledby={`${reactId}-label`}
      className={cn(
        "border-border bg-card text-card-foreground rounded-[var(--radius)] border",
        className
      )}
      {...rootProps}
    >
      <div className="border-border flex flex-wrap items-center gap-2 border-b px-3 py-2">
        <p id={`${reactId}-label`} className="text-sm font-semibold">
          {label}
        </p>

        <div
          role="group"
          aria-label="Signature method"
          className="border-border ml-auto inline-flex rounded-full border p-0.5"
        >
          {(
            [
              { id: "draw" as const, icon: PenLine, text: "Draw" },
              { id: "type" as const, icon: Type, text: "Type" },
            ] satisfies {
              id: SignatureMode
              icon: typeof PenLine
              text: string
            }[]
          ).map((option) => {
            const Icon = option.icon
            const isActive = activeMode === option.id

            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={isActive}
                className={cn(
                  "inline-flex min-h-9 items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold",
                  isActive
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setMode(option.id)}
              >
                <Icon aria-hidden="true" size={13} />
                {option.text}
              </button>
            )
          })}
        </div>
      </div>

      <div className="p-3">
        {activeMode === "draw" ? (
          <canvas
            ref={canvasRef}
            data-slot="signature-pad-canvas"
            aria-label={`${label}. Drawing area. Switch to typing for a keyboard alternative.`}
            role="img"
            className="border-border w-full touch-none rounded-[calc(var(--radius)-0.25rem)] border border-dashed"
            style={{ height }}
            onPointerDown={(event) => {
              if (event.button !== 0) return
              const ctx = context()
              if (!ctx) return

              event.currentTarget.setPointerCapture(event.pointerId)
              drawing.current = true

              const { x, y } = pointFrom(event)
              ctx.beginPath()
              ctx.moveTo(x, y)
            }}
            onPointerMove={(event) => {
              if (!drawing.current) return
              const ctx = context()
              if (!ctx) return

              const { x, y } = pointFrom(event)
              ctx.lineTo(x, y)
              ctx.stroke()
              if (!hasInk) setHasInk(true)
            }}
            onPointerUp={() => {
              if (!drawing.current) return
              drawing.current = false
              commitDrawing()
            }}
            onPointerCancel={() => {
              drawing.current = false
            }}
          />
        ) : (
          <div>
            <label className="sr-only" htmlFor={`${reactId}-typed`}>
              {label}
            </label>
            <input
              id={`${reactId}-typed`}
              className="border-border placeholder:text-muted-foreground flex w-full items-center rounded-[calc(var(--radius)-0.25rem)] border border-dashed bg-transparent px-4 text-3xl outline-none"
              placeholder={typedPlaceholder}
              style={{ height, fontFamily: typedFontFamily }}
              value={typed}
              onChange={(event) => {
                const next = event.target.value
                setTyped(next)
                emit.current?.(
                  next.trim() ? { mode: "type", text: next } : null
                )
              }}
            />
          </div>
        )}

        <div className="mt-2 flex items-center gap-3">
          <p className="text-muted-foreground text-xs">{hint}</p>

          <button
            type="button"
            data-slot="signature-pad-clear"
            disabled={isEmpty}
            className="text-muted-foreground hover:text-foreground focus-visible:ring-ring ml-auto inline-flex min-h-11 items-center gap-1.5 rounded-full px-2 text-xs font-semibold focus-visible:ring-2 focus-visible:outline-none disabled:opacity-40"
            onClick={clear}
          >
            <Eraser aria-hidden="true" size={13} />
            {clearLabel}
          </button>
        </div>
      </div>
    </section>
  )
}
