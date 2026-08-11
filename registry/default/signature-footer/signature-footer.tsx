import * as React from "react"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface SignatureFooterProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  "children"
> {
  eyebrow?: React.ReactNode
  heading: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  navigation?: React.ReactNode
  brand?: React.ReactNode
  meta?: React.ReactNode
  wordmark: string
}

export const SignatureFooter = React.forwardRef<
  HTMLElement,
  SignatureFooterProps
>(function SignatureFooter(
  {
    eyebrow,
    heading,
    description,
    action,
    navigation,
    brand,
    meta,
    wordmark,
    className,
    ...props
  },
  forwardedRef
) {
  return (
    <footer
      {...props}
      data-slot="signature-footer"
      ref={forwardedRef}
      className={cn("bg-foreground text-background overflow-hidden", className)}
    >
      <div
        data-slot="signature-footer-inner"
        className="mx-auto max-w-[90rem] px-4 pt-12 md:px-8 md:pt-16 lg:px-12 lg:pt-24"
      >
        <div className="grid gap-16 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)] lg:gap-24">
          <div>
            {eyebrow && (
              <p
                data-slot="signature-footer-eyebrow"
                className="text-background/60 text-xs font-bold tracking-[0.08em] uppercase"
              >
                {eyebrow}
              </p>
            )}
            <h2
              data-slot="signature-footer-heading"
              className="mt-6 max-w-4xl text-[clamp(3rem,7vw,7rem)] leading-[0.9] font-semibold tracking-[-0.055em] text-balance"
            >
              {heading}
            </h2>
            {description && (
              <p
                data-slot="signature-footer-description"
                className="text-background/70 mt-8 max-w-xl text-lg leading-relaxed text-pretty"
              >
                {description}
              </p>
            )}
            {action && (
              <div data-slot="signature-footer-action" className="mt-8">
                {action}
              </div>
            )}
          </div>

          {navigation && (
            <div data-slot="signature-footer-navigation" className="self-end">
              {navigation}
            </div>
          )}
        </div>

        {(brand || meta) && (
          <div
            data-slot="signature-footer-meta"
            className="border-background/15 mt-16 flex flex-col gap-6 border-t py-6 text-sm sm:flex-row sm:items-center sm:justify-between"
          >
            {brand}
            {meta}
          </div>
        )}

        <div
          data-slot="signature-footer-wordmark"
          className="text-background/[0.07] overflow-hidden pt-8 text-center text-[clamp(5rem,17vw,15rem)] leading-[0.72] font-semibold tracking-[-0.075em] whitespace-nowrap select-none"
          aria-hidden="true"
        >
          {wordmark}
        </div>
      </div>
    </footer>
  )
})
