"use client"

import * as React from "react"
import { Dialog } from "@base-ui/react/dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

export type SidePanelSide = "left" | "right"

export type SidePanelProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /**
   * true traps focus and locks the page. "trap-focus" keeps the page usable
   * behind it, for an inspector you work beside rather than instead of.
   */
  modal?: boolean | "trap-focus"
  /** Close when the backdrop is pressed. Defaults to true. */
  dismissible?: boolean
  /** Close on Escape. Turn it off where there is unsaved work. */
  closeOnEscape?: boolean
  hideBackdrop?: boolean
  /** How far a panel opened inside another sits from the edge. */
  stackOffset?: string
  /** Milliseconds the slide takes. Defaults to 250. */
  duration?: number
  /** Which edge it comes from. Defaults to the right. */
  side?: SidePanelSide
  title: React.ReactNode
  /** A line under the title, and the dialog's description. */
  description?: React.ReactNode
  /** Pinned above the content: filters, a search, a tab strip. */
  toolbar?: React.ReactNode
  /** Pinned below it: the actions that close or apply. */
  footer?: React.ReactNode
  children?: React.ReactNode
  closeLabel?: string
  className?: string
  /** Width at the medium breakpoint and up. Full width below it. */
  width?: string
}

/**
 * A pane that comes in from the side: an inspector, a filter set, the detail
 * of the row you clicked. Base UI supplies the dialog, so the focus trap, the
 * scroll lock, Escape, and focus restoration are not ours to get wrong.
 */
/** Panels opened inside a panel stack, each one further from the edge. */
const SidePanelDepth = React.createContext(0)

export function SidePanel({
  open,
  onOpenChange,
  modal = true,
  dismissible = true,
  closeOnEscape = true,
  hideBackdrop = false,
  stackOffset = "1.75rem",
  duration = 250,
  side = "right",
  title,
  description,
  toolbar,
  footer,
  children,
  closeLabel = "Close",
  className,
  width = "28rem",
}: SidePanelProps) {
  const depth = React.useContext(SidePanelDepth)

  return (
    <Dialog.Root
      open={open}
      modal={modal}
      disablePointerDismissal={!dismissible}
      onOpenChange={(next, details) => {
        // Escape is the browser's, so refusing it has to be done here.
        if (!next && !closeOnEscape && details.reason === "escape-key") {
          details.cancel()
          return
        }

        onOpenChange(next)
      }}
    >
      <Dialog.Portal>
        {!hideBackdrop && (
          <Dialog.Backdrop
            data-slot="side-panel-backdrop"
            className="bg-foreground/40 fixed inset-0 z-[100] transition-opacity duration-200 data-[closed]:pointer-events-none data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 motion-reduce:transition-none"
          />
        )}
        <Dialog.Viewport
          data-slot="side-panel-viewport"
          className={cn(
            "fixed inset-y-0 z-[101] flex max-w-full data-[closed]:pointer-events-none",
            side === "right" ? "right-0" : "left-0"
          )}
        >
          <Dialog.Popup
            data-slot="side-panel"
            data-side={side}
            data-depth={depth || undefined}
            style={
              {
                "--side-panel-width": width,
                "--side-panel-duration": `${duration}ms`,
                // Each panel opened inside another sits this much further from
                // the edge, so the ones behind stay visible as strips.
                [side === "right" ? "marginRight" : "marginLeft"]:
                  depth > 0 ? `calc(${stackOffset} * ${depth})` : undefined,
              } as React.CSSProperties
            }
            className={cn(
              "bg-card text-card-foreground border-border flex h-full w-screen flex-col shadow-2xl transition-[opacity,translate] duration-[var(--side-panel-duration)] md:w-[var(--side-panel-width)]",
              side === "right"
                ? "border-l data-[ending-style]:translate-x-full data-[starting-style]:translate-x-full"
                : "border-r data-[ending-style]:-translate-x-full data-[starting-style]:-translate-x-full",
              "data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 motion-reduce:transition-none",
              className
            )}
          >
            <header
              data-slot="side-panel-header"
              className="border-border flex items-start gap-3 border-b px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <Dialog.Title className="truncate text-sm font-semibold">
                  {title}
                </Dialog.Title>
                {description && (
                  <Dialog.Description className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
                    {description}
                  </Dialog.Description>
                )}
              </div>
              <Dialog.Close
                aria-label={closeLabel}
                className="text-muted-foreground hover:bg-muted hover:text-foreground -mr-1 inline-flex size-8 shrink-0 items-center justify-center rounded-md transition-colors duration-150 motion-reduce:transition-none"
              >
                <X aria-hidden="true" size={16} />
              </Dialog.Close>
            </header>

            {toolbar && (
              <div
                data-slot="side-panel-toolbar"
                className="border-border border-b px-4 py-2.5"
              >
                {toolbar}
              </div>
            )}

            {/* The body scrolls; the header, toolbar, and footer stay put. */}
            <div
              data-slot="side-panel-body"
              className="min-h-0 flex-1 overflow-y-auto px-4 py-4"
            >
              <SidePanelDepth.Provider value={depth + 1}>
                {children}
              </SidePanelDepth.Provider>
            </div>

            {footer && (
              <div
                data-slot="side-panel-footer"
                className="border-border flex items-center justify-end gap-2 border-t px-4 py-3"
              >
                {footer}
              </div>
            )}
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
