"use client"

import * as React from "react"
import { Slider } from "@base-ui/react/slider"
import { motion, useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"

export interface ElasticSliderProps extends Omit<
  React.ComponentPropsWithoutRef<typeof Slider.Root>,
  "children" | "defaultValue" | "onValueChange" | "onValueCommitted" | "value"
> {
  label: React.ReactNode
  defaultValue?: number
  value?: number
  onValueChange?: (value: number) => void
  onValueCommitted?: (value: number) => void
  min?: number
  max?: number
  step?: number
  name?: string
  disabled?: boolean
  formatValue?: (value: number) => string
  className?: string
}

export const ElasticSlider = React.forwardRef<
  React.ComponentRef<typeof Slider.Root>,
  ElasticSliderProps
>(function ElasticSlider(
  {
    label,
    defaultValue = 50,
    value,
    onValueChange,
    onValueCommitted,
    min = 0,
    max = 100,
    step = 1,
    name,
    disabled,
    formatValue = (nextValue) => `${nextValue}%`,
    className,
    ...rootProps
  },
  forwardedRef
) {
  const [internalValue, setInternalValue] = React.useState(defaultValue)
  const prefersReducedMotion = useReducedMotion()
  const currentValue = value ?? internalValue
  const range = Math.max(max - min, 1)
  const progress = Math.min(Math.max((currentValue - min) / range, 0), 1)
  const atStart = progress <= 0.02
  const atEnd = progress >= 0.98

  function readSingleValue(nextValue: number | number[]) {
    return Array.isArray(nextValue) ? (nextValue[0] ?? min) : nextValue
  }

  return (
    <Slider.Root
      {...rootProps}
      data-slot="elastic-slider"
      ref={forwardedRef}
      value={value}
      defaultValue={defaultValue}
      min={min}
      max={max}
      step={step}
      name={name}
      disabled={disabled}
      thumbAlignment="edge"
      onValueChange={(nextValue) => {
        const singleValue = readSingleValue(nextValue)
        setInternalValue(singleValue)
        onValueChange?.(singleValue)
      }}
      onValueCommitted={(nextValue) =>
        onValueCommitted?.(readSingleValue(nextValue))
      }
      className={cn(
        "text-foreground grid w-full gap-5 data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className
      )}
    >
      <div
        data-slot="elastic-slider-header"
        className="flex items-baseline justify-between gap-4"
      >
        <Slider.Label
          data-slot="elastic-slider-label"
          className="text-sm font-medium"
        >
          {label}
        </Slider.Label>
        <output
          data-slot="elastic-slider-output"
          className="font-mono text-sm font-semibold tabular-nums"
        >
          {formatValue(currentValue)}
        </output>
      </div>

      <motion.div
        data-slot="elastic-slider-motion"
        style={{
          transformOrigin: atStart ? "left" : atEnd ? "right" : "center",
        }}
        animate={
          prefersReducedMotion
            ? undefined
            : {
                scaleX: atStart || atEnd ? 1.025 : 1,
                scaleY: atStart || atEnd ? 1.12 : 1,
              }
        }
        transition={{ type: "spring", stiffness: 460, damping: 26, mass: 0.4 }}
      >
        <Slider.Control
          data-slot="elastic-slider-control"
          className="flex min-h-11 touch-none items-center py-4 select-none"
        >
          <Slider.Track
            data-slot="elastic-slider-track"
            className="bg-muted relative h-2 w-full rounded-full shadow-inner"
          >
            <Slider.Indicator
              data-slot="elastic-slider-indicator"
              className="bg-primary rounded-full"
            />
            <Slider.Thumb
              data-slot="elastic-slider-thumb"
              className="border-primary bg-background focus-visible:ring-ring/35 size-6 rounded-full border-2 shadow-md transition-transform duration-150 outline-none hover:scale-105 focus-visible:ring-4 data-dragging:scale-105 motion-reduce:transition-none"
              aria-label={typeof label === "string" ? label : "Value"}
            />
          </Slider.Track>
        </Slider.Control>
      </motion.div>
    </Slider.Root>
  )
})
