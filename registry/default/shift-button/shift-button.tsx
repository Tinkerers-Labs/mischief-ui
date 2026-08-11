"use client"

import * as React from "react"
import { Button } from "@base-ui/react/button"
import { ArrowRight } from "lucide-react"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface ShiftButtonProps extends Omit<
  React.ComponentPropsWithoutRef<typeof Button>,
  "children"
> {
  children: React.ReactNode
  leadingIcon: React.ReactNode
  trailingIcon?: React.ReactNode
}

export const ShiftButton = React.forwardRef<HTMLElement, ShiftButtonProps>(
  function ShiftButton(
    {
      children,
      leadingIcon,
      trailingIcon = <ArrowRight aria-hidden="true" />,
      className,
      ...buttonProps
    },
    ref
  ) {
    return (
      <Button
        {...buttonProps}
        ref={ref}
        className={cn(
          "group bg-foreground text-background focus-visible:ring-ring hover:bg-foreground/90 inline-grid min-h-11 grid-cols-[1.25rem_auto_1.25rem] items-center gap-3 overflow-hidden rounded-full px-6 py-3 text-sm font-semibold no-underline transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none data-disabled:cursor-not-allowed data-disabled:opacity-50",
          className
        )}
      >
        <span
          data-slot="shift-button-leading-icon"
          className="flex size-5 items-center justify-center transition-[transform,opacity] duration-150 ease-out group-hover:-translate-x-2 group-hover:opacity-0 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0 motion-reduce:group-hover:opacity-100 [&_svg]:size-5"
        >
          {leadingIcon}
        </span>
        <span data-slot="shift-button-label" className="whitespace-nowrap">
          {children}
        </span>
        <span
          data-slot="shift-button-trailing-icon"
          className="flex size-5 translate-x-2 items-center justify-center opacity-0 transition-[transform,opacity] duration-150 ease-out group-hover:translate-x-0 group-hover:opacity-100 motion-reduce:hidden [&_svg]:size-5"
        >
          {trailingIcon}
        </span>
      </Button>
    )
  }
)
