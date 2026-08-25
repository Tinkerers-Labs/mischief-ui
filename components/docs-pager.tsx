import Link from "next/link"
import { ArrowLeft, ArrowRight } from "lucide-react"

import { docsNeighbours } from "@/lib/docs-nav"

/** The way on, at the foot of a page somebody has just finished reading. */
export function DocsPager({ href }: { href: string }) {
  const { previous, next } = docsNeighbours(href)

  if (!previous && !next) return null

  return (
    <nav className="docs-pager" aria-label="Documentation">
      {previous ? (
        <Link className="docs-pager-link" href={previous.href}>
          <ArrowLeft aria-hidden="true" size={14} />
          <span>
            <span className="docs-pager-eyebrow">Previous</span>
            {previous.label}
          </span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link className="docs-pager-link docs-pager-next" href={next.href}>
          <span>
            <span className="docs-pager-eyebrow">Next</span>
            {next.label}
          </span>
          <ArrowRight aria-hidden="true" size={14} />
        </Link>
      ) : (
        <span />
      )}
    </nav>
  )
}
