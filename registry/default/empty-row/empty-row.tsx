import * as React from "react"

import { cn } from "@/lib/utils"

export type EmptyRowProps = Omit<
  React.HTMLAttributes<HTMLElement>,
  "children"
> & {
  children?: React.ReactNode
  /**
   * Renders a table row spanning this many columns. Without it the row is a
   * paragraph, for a list or a popover.
   */
  colSpan?: number
}

/**
 * One line saying a list came back empty. The smallest of the three: a row
 * inside something, where Empty State fills a panel and Not Found fills a
 * page. A filtered table wants a line, not an illustration.
 */
export function EmptyRow({
  children = "No matches.",
  colSpan,
  className,
  ...rootProps
}: EmptyRowProps) {
  const text = cn("text-muted-foreground px-4 py-8 text-sm", className)

  if (colSpan === undefined) {
    return (
      <p data-slot="empty-row" className={text} {...rootProps}>
        {children}
      </p>
    )
  }

  return (
    <tr data-slot="empty-row" {...rootProps}>
      <td className={text} colSpan={colSpan}>
        {children}
      </td>
    </tr>
  )
}
