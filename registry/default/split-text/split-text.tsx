"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type SplitBy = "character" | "word" | "line"

export type SplitAnimation = "rise" | "fade" | "blur" | "scale"

export type SplitTextProps = Omit<
  React.HTMLAttributes<HTMLSpanElement>,
  "children"
> & {
  children: string
  by?: SplitBy
  animation?: SplitAnimation
  /** Milliseconds between one piece and the next. */
  stagger?: number
  delay?: number
  duration?: number
  /** Whether it plays on arrival or as soon as it is on screen. */
  trigger?: "mount" | "view"
  as?: "span" | "h1" | "h2" | "h3" | "p"
}

const RESTING: Record<SplitAnimation, string> = {
  rise: "translate-y-[0.6em] opacity-0",
  fade: "opacity-0",
  blur: "opacity-0 blur-[6px]",
  scale: "scale-75 opacity-0",
}

function pieces(text: string, by: SplitBy) {
  if (by === "line") return text.split("\n")
  if (by === "word") return text.split(/(\s+)/)
  return Array.from(text)
}

/**
 * Animates a string one character, word, or line at a time. The whole string
 * is carried on the element as its label, so it is announced once as ordinary
 * text rather than as a pile of single letters.
 */
export function SplitText({
  children,
  by = "character",
  animation = "rise",
  stagger = 28,
  delay = 0,
  duration = 620,
  trigger = "view",
  as: Component = "span",
  className,
  ...rootProps
}: SplitTextProps) {
  const ref = React.useRef<HTMLSpanElement>(null)
  const [shown, setShown] = React.useState(trigger === "mount")

  React.useEffect(() => {
    if (trigger === "mount") return

    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShown(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [trigger])

  const parts = React.useMemo(() => pieces(children, by), [children, by])

  return (
    <Component
      ref={ref as React.Ref<HTMLHeadingElement>}
      data-slot="split-text"
      aria-label={children}
      className={cn("inline-block", className)}
      {...rootProps}
    >
      {parts.map((part, index) => {
        const blank = part.trim() === ""

        return (
          <span
            key={`${part}-${index}`}
            aria-hidden="true"
            className={cn(
              "inline-block whitespace-pre transition-[opacity,translate,scale,filter] ease-out",
              "motion-reduce:translate-none motion-reduce:scale-100 motion-reduce:opacity-100 motion-reduce:blur-none motion-reduce:transition-none",
              shown || blank
                ? "translate-none scale-100 opacity-100 blur-none"
                : RESTING[animation]
            )}
            style={{
              transitionDelay: `${delay + index * stagger}ms`,
              transitionDuration: `${duration}ms`,
            }}
          >
            {by === "line" && index < parts.length - 1 ? `${part}\n` : part}
          </span>
        )
      })}
    </Component>
  )
}
