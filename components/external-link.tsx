import * as React from "react"

/**
 * Says where it goes as well as going there. The note is punctuation-led,
 * because the leading space of a text node is dropped when the accessible
 * name is computed, and it is skipped when the link already has a name of
 * its own to avoid announcing the destination twice.
 */
export function ExternalLink({
  children,
  rel = "noopener noreferrer",
  target = "_blank",
  ...props
}: React.ComponentPropsWithoutRef<"a">) {
  return (
    <a {...props} rel={rel} target={target}>
      {children}
      {props["aria-label"] ? null : (
        <span className="sr-only">, opens in a new tab</span>
      )}
    </a>
  )
}
