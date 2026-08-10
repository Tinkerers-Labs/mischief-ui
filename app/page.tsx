import { ArrowDown, Code2 } from "lucide-react"

import { ComponentGallery } from "@/components/component-gallery"

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Mischief home">
          <span className="brand-mark" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          Mischief
        </a>
        <a
          className="github-link"
          href="https://github.com/Tinkerers-Labs/mischief"
        >
          <Code2 aria-hidden="true" size={18} />
          GitHub
        </a>
      </header>

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
      </section>

      <ComponentGallery />

      <footer>
        <p>Built carefully at Tinkerers Labs.</p>
        <p>MIT licensed. Take the code and make it yours.</p>
      </footer>
    </main>
  )
}
