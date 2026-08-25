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

type Piece = { part: string; index: number }

/**
 * A line may only break between words. Every piece is its own inline-block,
 * which the browser is otherwise free to break between, so splitting by
 * character would let it cut "deserve" into "des" and "erve".
 */
function runs(parts: string[]): Piece[][] {
  const out: Piece[][] = []
  let word: Piece[] = []

  parts.forEach((part, index) => {
    if (part.trim() === "") {
      if (word.length) out.push(word)
      out.push([{ part, index }])
      word = []
      return
    }

    word.push({ part, index })
  })

  if (word.length) out.push(word)
  return out
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
  const [shown, setShown] = React.useState(false)

  React.useEffect(() => {
    if (trigger !== "mount") return

    // A frame first, so the resting state is painted and the transition has
    // somewhere to travel from. Flipping it in the same tick as the first
    // render leaves the characters already arrived, and nothing animates.
    const frame = requestAnimationFrame(() => setShown(true))
    return () => cancelAnimationFrame(frame)
  }, [trigger])

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
      {runs(parts).map((word, at) => (
        <span
          key={`word-${at}`}
          aria-hidden="true"
          className="inline-block whitespace-nowrap"
        >
          {word.map(({ part, index }) => {
            const blank = part.trim() === ""

            return (
              <span
                key={`${part}-${index}`}
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
        </span>
      ))}
    </Component>
  )
}
