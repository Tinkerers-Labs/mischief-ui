import type { SVGProps } from "react"

import { siteConfig } from "@/site.config"

export function MischiefMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" role="img" aria-label={siteConfig.name} {...props}>
      <path
        d="M7.5 36.5C8.8 27.6 9.6 19.6 12.4 11.5C17.1 17.4 20.6 24 24.1 30.7C27.3 24.8 29.1 16.8 33.2 9.8C36.4 17.7 38.4 27.5 40.5 36.5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="6.5"
      />
      <path
        d="M40.2 3.8L41.4 7.1L44.8 8.3L41.4 9.5L40.2 12.8L39 9.5L35.7 8.3L39 7.1L40.2 3.8Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function BrandLogo() {
  return (
    <span className="brand-lockup">
      <span className="brand-mark-shell" aria-hidden="true">
        <MischiefMark />
      </span>
      <span>{siteConfig.name}</span>
    </span>
  )
}
