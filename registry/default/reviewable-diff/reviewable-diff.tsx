"use client"

import * as React from "react"

import {
  diffLines,
  toHunks,
  type DiffHunk,
  type DiffLineKind,
} from "@/registry/default/diff-view/diff-view"
import { cn } from "@/lib/utils"

export type ReviewableDiffProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children" | "onChange"
> & {
  before?: string
  after?: string
  /** Already split into hunks, when you have them from a real diff. */
  hunks?: readonly DiffHunk[]
  filename?: string
  context?: number
  /** Hunk indexes that start staged. Defaults to all of them. */
  defaultStaged?: readonly number[]
  staged?: readonly number[]
  onStagedChange?: (staged: number[]) => void
  onApply?: (hunks: DiffHunk[]) => void
  applyLabel?: string
}

const tone: Record<DiffLineKind, string> = {
  add: "bg-[color-mix(in_oklab,var(--accent)_18%,transparent)]",
  remove: "bg-[color-mix(in_oklab,var(--destructive)_14%,transparent)]",
  context: "",
}

const sign: Record<DiffLineKind, string> = {
  add: "+",
  remove: "-",
  context: " ",
}

function countOf(hunk: DiffHunk) {
  let added = 0
  let removed = 0

  for (const line of hunk.lines) {
    if (line.kind === "add") added++
    if (line.kind === "remove") removed++
  }

  return { added, removed }
}

/**
 * A proposed change reviewed a hunk at a time: take three of the seven, leave
 * the rest, apply what you took.
 *
 * All or nothing is the wrong shape for a change somebody else wrote. The
 * useful half of an agent's diff and the part that misunderstood the codebase
 * usually arrive in the same patch.
 */
export function ReviewableDiff({
  before = "",
  after = "",
  hunks,
  filename,
  context = 3,
  defaultStaged,
  staged,
  onStagedChange,
  onApply,
  applyLabel = "Apply staged",
  className,
  ...rootProps
}: ReviewableDiffProps) {
  const resolved = React.useMemo(
    () => hunks ?? toHunks(diffLines(before, after), context),
    [hunks, before, after, context]
  )

  // Staged indexes belong to one set of hunks. Keeping them beside the hunks
  // they were chosen from means a new diff starts fresh rather than carrying
  // positions that now point at something else.
  const [held, setHeld] = React.useState<{
    of: readonly DiffHunk[]
    staged: readonly number[]
  } | null>(null)

  const chosen =
    staged ??
    (held?.of === resolved
      ? held.staged
      : (defaultStaged ?? resolved.map((_, at) => at)))
  const isStaged = (at: number) => chosen.includes(at)

  const set = (next: number[]) => {
    if (staged === undefined) setHeld({ of: resolved, staged: next })
    onStagedChange?.(next)
  }

  const toggle = (at: number) =>
    set(
      isStaged(at) ? chosen.filter((one) => one !== at) : [...chosen, at].sort()
    )

  const totals = chosen.reduce(
    (sum, at) => {
      const hunk = resolved[at]
      if (!hunk) return sum
      const { added, removed } = countOf(hunk)
      return { added: sum.added + added, removed: sum.removed + removed }
    },
    { added: 0, removed: 0 }
  )

  const summary = `${chosen.length} of ${resolved.length} ${
    resolved.length === 1 ? "hunk" : "hunks"
  } staged, ${totals.added} added and ${totals.removed} removed`

  return (
    <div
      data-slot="reviewable-diff"
      className={cn(
        "border-border bg-background w-full overflow-hidden rounded-xl border font-mono text-xs",
        className
      )}
      {...rootProps}
    >
      <div className="border-border flex items-center gap-3 border-b px-3 py-2">
        {filename ? (
          <span className="text-foreground truncate font-medium">
            {filename}
          </span>
        ) : null}
        <span className="text-muted-foreground ms-auto shrink-0 font-sans text-xs tabular-nums">
          {chosen.length}/{resolved.length} hunks
          <span className="ms-2 text-[color-mix(in_oklab,var(--accent)_75%,var(--foreground))]">
            +{totals.added}
          </span>
          <span className="text-destructive ms-1.5">-{totals.removed}</span>
        </span>
      </div>

      {resolved.length === 0 ? (
        <p className="text-muted-foreground px-3 py-4 font-sans text-xs">
          No changes.
        </p>
      ) : (
        <>
          <ul role="group" aria-label={`Hunks in ${filename ?? "the change"}`}>
            {resolved.map((hunk, at) => {
              const { added, removed } = countOf(hunk)
              const on = isStaged(at)
              const title = hunk.header ?? `Hunk ${at + 1}`

              return (
                <li
                  key={hunk.header ?? at}
                  data-staged={on ? "" : undefined}
                  className="border-border not-last:border-b"
                >
                  <label
                    className={cn(
                      "hover:bg-muted/50 focus-within:ring-ring flex cursor-pointer items-center gap-2 px-3 py-1.5 transition-colors focus-within:ring-2 focus-within:ring-inset motion-reduce:transition-none",
                      !on && "opacity-60"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={() => toggle(at)}
                      /* Named here rather than left to the label, whose parts
                         are joined without the spaces that sit between them. */
                      aria-label={`Stage ${title}, ${added} added, ${removed} removed`}
                      className="accent-primary size-4 shrink-0 focus-visible:outline-none"
                    />
                    <span className="text-muted-foreground truncate font-sans">
                      {title}
                    </span>
                    <span className="text-muted-foreground ms-auto shrink-0 font-sans tabular-nums">
                      +{added} -{removed}
                    </span>
                  </label>

                  <div className={cn("overflow-x-auto", !on && "opacity-45")}>
                    {hunk.lines.map((line, index) => (
                      <div
                        key={index}
                        className={cn("flex whitespace-pre", tone[line.kind])}
                      >
                        <span
                          aria-hidden="true"
                          className="text-muted-foreground w-10 shrink-0 pe-2 text-end tabular-nums"
                        >
                          {line.afterNumber ?? line.beforeNumber ?? ""}
                        </span>
                        <span className="text-muted-foreground w-4 shrink-0 select-none">
                          {sign[line.kind]}
                        </span>
                        <span className="pe-3">{line.text}</span>
                      </div>
                    ))}
                  </div>
                </li>
              )
            })}
          </ul>

          <div className="border-border flex items-center gap-2 border-t px-3 py-2">
            <button
              type="button"
              onClick={() => set(resolved.map((_, at) => at))}
              className="text-muted-foreground hover:text-foreground focus-visible:ring-ring rounded-md px-2 py-1 font-sans text-xs transition-colors focus-visible:ring-2 focus-visible:outline-none motion-reduce:transition-none"
            >
              Stage all
            </button>
            <button
              type="button"
              onClick={() => set([])}
              className="text-muted-foreground hover:text-foreground focus-visible:ring-ring rounded-md px-2 py-1 font-sans text-xs transition-colors focus-visible:ring-2 focus-visible:outline-none motion-reduce:transition-none"
            >
              Stage none
            </button>

            <button
              type="button"
              disabled={chosen.length === 0}
              onClick={() =>
                onApply?.(chosen.map((at) => resolved[at]!).filter(Boolean))
              }
              className="bg-foreground text-background focus-visible:ring-ring ms-auto inline-flex min-h-8 items-center rounded-md px-3 font-sans text-xs font-medium transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:outline-none disabled:opacity-40 motion-reduce:transition-none"
            >
              {applyLabel}
            </button>
          </div>
        </>
      )}

      <span aria-live="polite" className="sr-only">
        {summary}
      </span>
    </div>
  )
}
