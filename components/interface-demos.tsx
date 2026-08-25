"use client"

import * as React from "react"

import { CopyButton } from "@/registry/default/copy-button/copy-button"
import { JsonViewer } from "@/registry/default/json-viewer/json-viewer"
import { Marquee } from "@/registry/default/marquee/marquee"
import { Reveal } from "@/registry/default/reveal/reveal"

/**
 * A rule demonstrated rather than asserted. Only a handful of rules get one:
 * the ones where reading the sentence does not teach what using it does.
 */

/** Reads the reader's real setting. It cannot be faked, so it is not faked. */
function useReducedMotion() {
  const [reduced, setReduced] = React.useState(false)

  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)")
    const sync = () => setReduced(query.matches)

    sync()
    query.addEventListener("change", sync)
    return () => query.removeEventListener("change", sync)
  }, [])

  return reduced
}

function FocusVisibleDemo() {
  return (
    <>
      <p className="rule-demo-hint">
        Click this button, then press Tab to reach it. The ring is for the
        second one only.
      </p>
      <button
        type="button"
        className="border-border bg-background focus-visible:ring-ring inline-flex min-h-9 items-center rounded-full border px-4 text-sm font-semibold focus-visible:ring-2 focus-visible:outline-none"
      >
        Click me, then Tab to me
      </button>
    </>
  )
}

function OneTabStopDemo() {
  return (
    <>
      <p className="rule-demo-hint">
        Tab in, then arrow around. One more Tab leaves the whole tree.
      </p>
      <JsonViewer
        className="max-w-sm"
        rootName="run"
        defaultExpandedDepth={2}
        value={{
          model: "claude-opus-5",
          usage: { input: 4182, output: 663 },
          tools: [{ name: "search", ok: true }],
        }}
      />
    </>
  )
}

function ReducedMotionDemo() {
  const reduced = useReducedMotion()

  return (
    <>
      <p className="rule-demo-hint">
        Your system is set to{" "}
        <strong>{reduced ? "reduce motion" : "allow motion"}</strong>, so this
        row is{" "}
        <strong>
          {reduced ? "a plain row you can scroll" : "running on its own"}
        </strong>
        . Change the setting and it changes here.
      </p>
      <Marquee className="max-w-md" duration={18} gap={10} pauseOnHover fade>
        {["Metaballs", "Redaction", "Voice Input", "Data Table", "Marquee"].map(
          (name) => (
            <span
              key={name}
              className="border-border bg-background text-muted-foreground inline-flex min-h-8 items-center rounded-full border px-3 text-xs font-semibold whitespace-nowrap"
            >
              {name}
            </span>
          )
        )}
      </Marquee>
    </>
  )
}

function AnnounceDemo() {
  return (
    <>
      <p className="rule-demo-hint">
        The icon changing says nothing to a screen reader. The sentence beneath
        is what it hears, and it is only said once.
      </p>
      <CopyButton value="npx shadcn@latest add @mischief/marquee" />
    </>
  )
}

function ArrivesAnywayDemo() {
  const reduced = useReducedMotion()

  return (
    <>
      <p className="rule-demo-hint">
        {reduced
          ? "Motion is off, so this simply is here — which is the point."
          : "This moved in when it reached the screen. With motion off it is here either way."}
      </p>
      <Reveal>
        <p className="border-border bg-background max-w-sm rounded-lg border p-3 text-sm">
          Content first. The movement is the part that was optional.
        </p>
      </Reveal>
    </>
  )
}

const DEMOS: Record<string, () => React.ReactElement> = {
  "focus-visible-only": FocusVisibleDemo,
  "keyboard-one-stop": OneTabStopDemo,
  "motion-reduced-is-not-frozen": ReducedMotionDemo,
  "motion-never-withholds": ArrivesAnywayDemo,
  "announce-state-changes": AnnounceDemo,
}

/** Mounts only once it is near the screen, so a page of these costs nothing. */
export function RuleDemo({ id }: { id: string }) {
  const Demo = DEMOS[id]
  const ref = React.useRef<HTMLDivElement>(null)
  const [near, setNear] = React.useState(false)

  React.useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        setNear(true)
        observer.disconnect()
      },
      { rootMargin: "200px" }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  if (!Demo) return null

  return (
    <div className="rule-demo" ref={ref}>
      {near ? <Demo /> : null}
    </div>
  )
}

export function hasRuleDemo(id: string) {
  return id in DEMOS
}
