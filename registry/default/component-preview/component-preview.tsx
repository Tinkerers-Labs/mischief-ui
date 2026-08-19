"use client"

import * as React from "react"
import { Check, Clipboard } from "lucide-react"

import { cn } from "@/lib/utils"

export type ComponentPreviewProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children" | "title"
> & {
  /** The living example. */
  children: React.ReactNode
  /** Source for the second tab. Without it there is only the preview. */
  code?: string
  title?: React.ReactNode
  defaultView?: "preview" | "code"
  previewLabel?: string
  codeLabel?: string
  /** Extra controls in the toolbar, such as a restart button. */
  actions?: React.ReactNode
  align?: "center" | "start"
  frameClassName?: string
  copyable?: boolean
}

type View = "preview" | "code"

export function ComponentPreview({
  children,
  code,
  title,
  defaultView = "preview",
  previewLabel = "Preview",
  codeLabel = "Code",
  actions,
  align = "center",
  frameClassName,
  copyable = true,
  className,
  ...rootProps
}: ComponentPreviewProps) {
  const id = React.useId()
  const [view, setView] = React.useState<View>(code ? defaultView : "preview")
  const [copied, setCopied] = React.useState(false)
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    []
  )

  const views: View[] = code ? ["preview", "code"] : ["preview"]
  const current = code ? view : "preview"

  async function copy() {
    if (!code) return

    await navigator.clipboard.writeText(code)
    setCopied(true)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), 1400)
  }

  // Arrow keys move between tabs, which is what a tablist is expected to do.
  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const step =
      event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0

    if (step === 0) return

    event.preventDefault()
    const next =
      views[(views.indexOf(current) + step + views.length) % views.length]!
    setView(next)
    document.getElementById(`${id}-${next}-tab`)?.focus()
  }

  return (
    <div
      data-slot="component-preview"
      className={cn(
        "border-border bg-muted/40 min-w-0 overflow-hidden rounded-[calc(var(--radius)+0.15rem)] border",
        className
      )}
      {...rootProps}
    >
      <div className="border-border flex items-center gap-2 border-b px-2.5 py-1.5">
        {title ? (
          <span className="text-muted-foreground mr-1 min-w-0 truncate text-xs">
            {title}
          </span>
        ) : null}

        <div
          role="tablist"
          aria-label="Example view"
          onKeyDown={onKeyDown}
          className="bg-muted/70 inline-flex min-w-0 items-center gap-0.5 rounded-lg p-0.5"
        >
          {views.map((entry) => (
            <button
              key={entry}
              id={`${id}-${entry}-tab`}
              type="button"
              role="tab"
              aria-selected={current === entry}
              aria-controls={`${id}-${entry}-panel`}
              tabIndex={current === entry ? 0 : -1}
              className="text-muted-foreground hover:text-foreground aria-selected:bg-card aria-selected:text-foreground min-h-7 rounded-md px-2.5 text-xs font-medium transition-colors duration-150 aria-selected:shadow-sm motion-reduce:transition-none"
              onClick={() => setView(entry)}
            >
              {entry === "preview" ? previewLabel : codeLabel}
            </button>
          ))}
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-0.5">
          {actions}

          {code && copyable ? (
            <button
              type="button"
              aria-label={copied ? "Copied" : "Copy code"}
              className="text-muted-foreground hover:bg-card hover:text-foreground inline-flex size-8 items-center justify-center rounded-md transition-colors duration-150 motion-reduce:transition-none"
              onClick={copy}
            >
              {copied ? (
                <Check aria-hidden="true" size={14} />
              ) : (
                <Clipboard aria-hidden="true" size={14} />
              )}
            </button>
          ) : null}
        </div>
      </div>

      {/*
        The preview stays mounted while the source is showing, so anything the
        reader set up in the example is still there when they switch back.
      */}
      <div
        id={`${id}-preview-panel`}
        role="tabpanel"
        aria-labelledby={`${id}-preview-tab`}
        hidden={current !== "preview"}
        className={cn(
          "bg-card flex min-h-40 p-6 md:p-10",
          align === "center" ? "items-center justify-center" : "items-start",
          frameClassName
        )}
      >
        {children}
      </div>

      {code ? (
        <div
          id={`${id}-code-panel`}
          role="tabpanel"
          aria-labelledby={`${id}-code-tab`}
          hidden={current !== "code"}
        >
          <pre
            data-slot="component-preview-code"
            tabIndex={0}
            className="text-foreground m-0 max-h-96 overflow-auto rounded-none bg-transparent px-3 py-2.5 font-[family-name:var(--font-mono),monospace] text-xs leading-relaxed"
          >
            <code>{code}</code>
          </pre>
        </div>
      ) : null}

      <span aria-live="polite" className="sr-only">
        {copied ? "Code copied to clipboard." : ""}
      </span>
    </div>
  )
}
