import { MischiefMark } from "@/components/brand-logo"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { siteConfig } from "@/site.config"

export default function BrandPage() {
  return (
    <>
      <SiteHeader />
      <main className="brand-page">
        <p className="eyebrow">The {siteConfig.name} mark</p>
        <h1>
          A crooked M<br />
          with a bright idea.
        </h1>
        <p className="brand-lead">
          The mark bends like the controls do. The small spark is the bit of
          surprise that makes something familiar feel alive.
        </p>

        <section className="brand-showcase">
          <div className="brand-tile brand-tile-paper">
            <MischiefMark />
            <span>{siteConfig.name}</span>
          </div>
          <div className="brand-tile brand-tile-ink">
            <MischiefMark />
            <span>{siteConfig.name}</span>
          </div>
        </section>

        <section className="brand-notes">
          <div>
            <p className="eyebrow">Mark</p>
            <h2>Keep it simple</h2>
            <p>
              Use the tomato mark on paper or the paper mark on ink. Leave
              enough room around it for the spark to breathe.
            </p>
            <a
              className="download-link"
              href="../brand/mischief-mark.svg"
              download
            >
              Download SVG
            </a>
          </div>
          <div>
            <p className="eyebrow">Palette</p>
            <h2>Warm, not loud</h2>
            <div className="swatches">
              <span className="swatch swatch-paper">Paper</span>
              <span className="swatch swatch-ink">Ink</span>
              <span className="swatch swatch-tomato">Tomato</span>
              <span className="swatch swatch-leaf">Leaf</span>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
