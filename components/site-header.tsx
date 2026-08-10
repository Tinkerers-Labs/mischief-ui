import Link from "next/link"
import { Code2 } from "lucide-react"

import { BrandLogo } from "@/components/brand-logo"

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="Mischief home">
        <BrandLogo />
      </Link>
      <nav className="site-nav" aria-label="Main navigation">
        <Link href="/docs">Docs</Link>
        <Link href="/docs/components/magnetic-tabs">Components</Link>
        <Link href="/brand">Brand</Link>
        <a href="https://www.npmjs.com/package/mischief-ui">npm</a>
        <a
          className="github-link"
          href="https://github.com/Tinkerers-Labs/mischief-ui"
          aria-label="Mischief on GitHub"
        >
          <Code2 aria-hidden="true" size={18} />
          <span className="nav-github-label">GitHub</span>
        </a>
      </nav>
    </header>
  )
}
