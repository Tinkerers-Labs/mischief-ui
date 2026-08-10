import * as React from "react"

export function ExternalLink({
  rel = "noopener noreferrer",
  target = "_blank",
  ...props
}: React.ComponentPropsWithoutRef<"a">) {
  return <a {...props} rel={rel} target={target} />
}
