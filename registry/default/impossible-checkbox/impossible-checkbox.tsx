"use client"

import * as React from "react"
import { clsx, type ClassValue } from "clsx"
import { motion, useAnimationControls, useReducedMotion } from "motion/react"
import { twMerge } from "tailwind-merge"

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface ImpossibleCheckboxProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "checked" | "defaultChecked" | "onChange" | "type"
> {
  onAttempt?: (attempt: number) => void
  revealAfter?: number
  angryAfter?: number
  className?: string
}

function BearFace({ angry }: { angry: boolean }) {
  return (
    <svg
      viewBox="0 0 284.94574 359.73706"
      preserveAspectRatio="xMinYMin"
      aria-hidden="true"
      className="size-full"
    >
      <g transform="translate(-7.5271369,-761.38595)">
        <g transform="matrix(1.2335313,0,0,1.2335313,-35.029693,-212.83637)">
          <path
            d="M 263.90933,1081.4151 A 113.96792,96.862576 0 0 0 149.99132,985.71456 113.96792,96.862576 0 0 0 36.090664,1081.4151 l 227.818666,0 z"
            fill="var(--impossible-bear)"
          />
          <path
            d="m 250.42825,903.36218 c 2e-5,66.27108 -44.75411,114.99442 -102.42825,114.99442 -57.674143,0 -98.428271,-48.72334 -98.428251,-114.99442 4e-6,-66.27106 40.754125,-92.99437 98.428251,-92.99437 57.67413,0 102.42825,26.72331 102.42825,92.99437 z"
            fill="var(--impossible-bear)"
          />
          <path
            d="m 217,972.86218 c 2e-5,21.53911 -30.44462,42.00002 -68,42.00002 -37.55538,0 -66.000019,-20.46091 -66,-42.00002 0,-21.53911 28.44464,-36 66,-36 37.55536,0 68,14.46089 68,36 z"
            fill="var(--impossible-muzzle)"
          />
          <path
            d="m 181.5,944.36218 c 0,8.28427 -20.59974,26.5 -32.75,26.5 -12.15026,0 -34.75,-18.21573 -34.75,-26.5 0,-8.28427 22.59974,-13.5 34.75,-13.5 12.15026,0 32.75,5.21573 32.75,13.5 z"
            fill="var(--impossible-features)"
          />
          <g>
            <ellipse
              cx="69"
              cy="823.07269"
              rx="34.5"
              ry="33.289474"
              fill="var(--impossible-bear)"
            />
            <path
              d="M 69,47.310547 A 24.25,23.399124 0 0 0 44.75,70.710938 24.25,23.399124 0 0 0 64.720703,93.720703 c 0.276316,-0.40734 0.503874,-0.867778 0.787109,-1.267578 1.70087,-2.400855 3.527087,-4.666237 5.470704,-6.798828 1.943616,-2.132591 4.004963,-4.133318 6.179687,-6.003906 2.174725,-1.870589 4.461274,-3.611714 6.855469,-5.226563 2.394195,-1.614848 4.896019,-3.10338 7.498047,-4.46875 0.539935,-0.283322 1.133058,-0.500695 1.68164,-0.773437 A 24.25,23.399124 0 0 0 69,47.310547 Z"
              transform="translate(0,752.36216)"
              fill="var(--impossible-muzzle)"
            />
          </g>
          <g transform="matrix(-1,0,0,1,300,0)">
            <ellipse
              cx="69"
              cy="823.07269"
              rx="34.5"
              ry="33.289474"
              fill="var(--impossible-bear)"
            />
            <path
              d="M 69,47.310547 A 24.25,23.399124 0 0 0 44.75,70.710938 24.25,23.399124 0 0 0 64.720703,93.720703 c 0.276316,-0.40734 0.503874,-0.867778 0.787109,-1.267578 1.70087,-2.400855 3.527087,-4.666237 5.470704,-6.798828 1.943616,-2.132591 4.004963,-4.133318 6.179687,-6.003906 2.174725,-1.870589 4.461274,-3.611714 6.855469,-5.226563 2.394195,-1.614848 4.896019,-3.10338 7.498047,-4.46875 0.539935,-0.283322 1.133058,-0.500695 1.68164,-0.773437 A 24.25,23.399124 0 0 0 69,47.310547 Z"
              transform="translate(0,752.36216)"
              fill="var(--impossible-muzzle)"
            />
          </g>
          <ellipse
            cx="105.83063"
            cy="900.38916"
            rx="9.2701159"
            ry="9.6790915"
            fill="var(--impossible-features)"
          />
          <ellipse
            cx="186.89894"
            cy="900.38916"
            rx="9.2701159"
            ry="9.6790915"
            fill="var(--impossible-features)"
          />
          {angry && (
            <>
              <path
                d="m 92.05833,865.4614 39.42665,22.76299"
                fill="none"
                stroke="var(--impossible-features)"
                strokeLinecap="round"
                strokeWidth="4.86408424"
              />
              <path
                d="m 202.82482,865.4614 -39.42664,22.76299"
                fill="none"
                stroke="var(--impossible-features)"
                strokeLinecap="round"
                strokeWidth="4.86408424"
              />
            </>
          )}
        </g>
      </g>
    </svg>
  )
}

function BearArm() {
  return (
    <svg
      viewBox="0 0 250 100"
      preserveAspectRatio="xMinYMin"
      aria-hidden="true"
      className="size-full"
    >
      <g transform="translate(868.57141,-900.93359)">
        <path
          d="m -619.43416,945.05124 c 4.18776,73.01076 -78.25474,53.24342 -150.21568,52.94118 -82.38711,-0.34602 -98.92158,-19.44459 -98.92157,-47.05883 0,-27.61424 4.78794,-42.54902 73.82353,-42.54902 69.03559,0 171.43607,-30.93764 175.31372,36.66667 z"
          fill="var(--impossible-bear)"
        />
        <ellipse
          cx="-683.02264"
          cy="950.98572"
          rx="29.910826"
          ry="29.414362"
          fill="var(--impossible-muzzle)"
        />
      </g>
    </svg>
  )
}

export function ImpossibleCheckbox({
  onAttempt,
  revealAfter = 2,
  angryAfter = 5,
  className,
  "aria-label": ariaLabel = "Impossible checkbox",
  "aria-describedby": ariaDescribedBy,
  disabled,
  ...inputProps
}: ImpossibleCheckboxProps) {
  const [checked, setChecked] = React.useState(false)
  const [attempts, setAttempts] = React.useState(0)
  const [busy, setBusy] = React.useState(false)
  const [message, setMessage] = React.useState("Off")
  const generatedId = React.useId()
  const prefersReducedMotion = useReducedMotion()
  const bear = useAnimationControls()
  const armWrap = useAnimationControls()
  const arm = useAnimationControls()
  const paw = useAnimationControls()

  const bearIsVisible = attempts >= revealAfter
  const bearIsAngry = attempts >= angryAfter
  const statusId = `${inputProps.id ?? generatedId}-status`

  async function refuse() {
    if (busy || disabled) return

    const nextAttempt = attempts + 1
    const duration = prefersReducedMotion ? 0 : 0.2
    setBusy(true)
    setChecked(true)
    setMessage("On, briefly")
    onAttempt?.(nextAttempt)

    if (!prefersReducedMotion) {
      await new Promise((resolve) => window.setTimeout(resolve, 180))

      if (nextAttempt > revealAfter) {
        await bear.start({
          y: nextAttempt >= angryAfter ? "0%" : "40%",
          transition: { duration: 0.24 },
        })
      }

      await armWrap.start({ x: 32, transition: { duration } })
      await Promise.all([
        arm.start({ scaleX: 0.7, transition: { duration } }),
        paw.start({ scaleX: 0.85, transition: { duration: 0.1 } }),
      ])
    }

    setChecked(false)
    setMessage("The bear switched it back off")
    setAttempts(nextAttempt)

    if (!prefersReducedMotion) {
      await Promise.all([
        paw.start({ scaleX: 0, transition: { duration: 0.1 } }),
        arm.start({ scaleX: 1, transition: { duration: 0.1 } }),
        armWrap.start({ x: 0, transition: { duration } }),
        bear.start({ y: "100%", transition: { duration: 0.24 } }),
      ])
    }

    setBusy(false)
  }

  function peek() {
    if (!busy && bearIsVisible && !prefersReducedMotion) {
      void bear.start({ y: "40%", transition: { duration: 0.12 } })
    }
  }

  function hide() {
    if (!busy && !prefersReducedMotion) {
      void bear.start({ y: "100%", transition: { duration: 0.12 } })
    }
  }

  return (
    <div
      data-slot="impossible-checkbox"
      className={cn(
        "bg-muted relative isolate h-80 w-full max-w-xl overflow-hidden rounded-[var(--radius)] [--impossible-bear:var(--foreground)] [--impossible-features:var(--background)] [--impossible-muzzle:color-mix(in_oklch,var(--background)_82%,var(--foreground))]",
        className
      )}
    >
      <motion.div
        className="absolute top-1/2 left-1/2 z-0 h-36 w-28 -translate-x-[15%] -translate-y-3/4"
        initial={{ y: "100%" }}
        animate={bear}
      >
        {bearIsAngry && (
          <span className="bg-background text-foreground absolute -top-8 left-full z-10 rounded-md px-2.5 py-1.5 text-xs font-bold whitespace-nowrap shadow-sm">
            #@$%*!
          </span>
        )}
        <BearFace angry={bearIsAngry} />
      </motion.div>

      <div className="absolute inset-x-0 top-1/2 bottom-0 z-10 bg-inherit" />

      <motion.div
        className={cn(
          "absolute top-1/2 left-1/2 z-30 h-5 w-14 -translate-y-1/2",
          busy ? "opacity-100" : "opacity-0"
        )}
        initial={{ x: 0 }}
        animate={armWrap}
      >
        <motion.div
          className="absolute top-1/2 left-1/2 size-full origin-left -translate-x-[35%] -translate-y-1/2"
          initial={{ scaleX: 1 }}
          animate={arm}
        >
          <BearArm />
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute top-1/2 left-1/2 z-50 size-5 origin-right translate-x-[52px] -translate-y-1/2 rounded-full bg-[var(--impossible-bear)]"
        initial={{ scaleX: 0 }}
        animate={paw}
      />

      <label
        className="group has-focus-visible:ring-ring has-focus-visible:ring-offset-muted absolute top-1/2 left-1/2 z-40 h-16 w-32 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full has-focus-visible:ring-2 has-focus-visible:ring-offset-2 has-disabled:cursor-not-allowed has-disabled:opacity-50"
        onPointerEnter={peek}
        onPointerLeave={hide}
      >
        <span className="sr-only">{ariaLabel}</span>
        <input
          {...inputProps}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          aria-label={ariaLabel}
          aria-describedby={
            ariaDescribedBy ? `${ariaDescribedBy} ${statusId}` : statusId
          }
          onChange={() => void refuse()}
          className="cursor-inherit absolute inset-0 z-10 m-0 size-full opacity-0"
        />
        <span
          className={cn(
            "bg-border absolute inset-0 rounded-full transition-colors duration-200 motion-reduce:transition-none",
            checked && "bg-primary"
          )}
          aria-hidden="true"
        />
        <span
          className={cn(
            "bg-background absolute top-1 left-1 size-14 rounded-full shadow-sm transition-transform duration-200 motion-reduce:transition-none",
            checked && "translate-x-16"
          )}
          aria-hidden="true"
        />
      </label>

      <span className="sr-only" id={statusId} aria-live="polite">
        {message}
      </span>
    </div>
  )
}
