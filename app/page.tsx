import Link from "next/link"
import { ArrowDown } from "lucide-react"

import { ComponentGallery } from "@/components/component-gallery"
import { SiteHeader } from "@/components/site-header"

export default function Home() {
  return (
    <main>
      <SiteHeader />

      <section className="hero" id="top">
        <p className="eyebrow">Open source. Three components. No filler.</p>
        <h1>
          Good interfaces deserve <em>a little mischief.</em>
        </h1>
        <div className="hero-footer">
          <p>
            Playful, production-ready React components. Built on Base UI, styled
            with Tailwind, and ready for shadcn projects.
          </p>
          <a
            className="round-link"
            href="#components"
            aria-label="See components"
          >
            <ArrowDown aria-hidden="true" size={24} />
          </a>
        </div>
        <div className="hero-actions">
          <Link className="primary-link" href="/docs">
            Read the docs
          </Link>
          <a href="https://www.npmjs.com/package/mischief-ui">
            mischief-ui on npm
          </a>
        </div>
      </section>

      <ComponentGallery />

      <footer>
        <p>Built carefully at Tinkerers Labs.</p>
        <p>MIT licensed. Take the code and make it yours.</p>
      </footer>
    </main>
  )
}
