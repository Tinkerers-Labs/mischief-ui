"use client"

import * as React from "react"
import Link from "next/link"
import { Apple, Check, RotateCcw, Volume2 } from "lucide-react"

import { CopyCommand } from "@/components/copy-command"
import { FloatingIndexDemo } from "@/components/floating-index-demo"
import { ImageGalleryDemo } from "@/components/image-gallery-demo"
import { ElasticSlider } from "@/registry/default/elastic-slider/elastic-slider"
import { HoldButton } from "@/registry/default/hold-button/hold-button"
import { ImpossibleCheckbox } from "@/registry/default/impossible-checkbox/impossible-checkbox"
import { MagneticTabs } from "@/registry/default/magnetic-tabs/magnetic-tabs"
import { SignatureFooter } from "@/registry/default/signature-footer/signature-footer"
import { ShiftButton } from "@/registry/default/shift-button/shift-button"
import { registryInstallCommand } from "@/site.config"

function InstallCommand({ name }: { name: string }) {
  return <CopyCommand command={registryInstallCommand(name)} />
}

const tabItems = [
  {
    value: "overview",
    label: "Overview",
    content: (
      <div>
        <p className="font-semibold">Everything important is close by.</p>
        <p className="text-muted-foreground mt-1">
          Your download is ready and notifications are on.
        </p>
      </div>
    ),
  },
  {
    value: "activity",
    label: "Activity",
    content: (
      <div>
        <p className="font-semibold">Two files finished downloading.</p>
        <p className="text-muted-foreground mt-1">
          Nothing needs your attention right now.
        </p>
      </div>
    ),
  },
  {
    value: "settings",
    label: "Settings",
    content: (
      <div>
        <p className="font-semibold">Notifications are on.</p>
        <p className="text-muted-foreground mt-1">
          We will only tell you when something is worth seeing.
        </p>
      </div>
    ),
  },
]

export function ComponentGallery() {
  const [volume, setVolume] = React.useState(68)
  const [removed, setRemoved] = React.useState(false)

  return (
    <div className="gallery" id="components">
      <section className="component-section">
        <div className="component-copy">
          <p className="component-number">01 / Tactile controls</p>
          <h2>Magnetic Tabs</h2>
          <p>
            Familiar tabs with a gentle pull toward the pointer. The active
            surface stays clear, and keyboard navigation remains immediate.
          </p>
          <InstallCommand name="magnetic-tabs" />
          <Link className="detail-link" href="/docs/components/magnetic-tabs">
            Preview, API, and source
          </Link>
        </div>
        <div className="demo-frame">
          <div className="demo-content">
            <MagneticTabs items={tabItems} />
          </div>
        </div>
      </section>

      <section className="component-section">
        <div className="component-copy">
          <p className="component-number">02 / Tactile controls</p>
          <h2>Elastic Slider</h2>
          <p>
            A precise slider with a small amount of give at either end. The
            value is always visible and the control works without a pointer.
          </p>
          <InstallCommand name="elastic-slider" />
          <Link className="detail-link" href="/docs/components/elastic-slider">
            Preview, API, and source
          </Link>
        </div>
        <div className="demo-frame">
          <div className="demo-content slider-demo">
            <div className="mb-8 flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-full bg-white/10">
                <Volume2 aria-hidden="true" size={20} />
              </span>
              <div>
                <p className="font-semibold">Notification volume</p>
                <p className="text-sm text-white/60">
                  Changes play immediately.
                </p>
              </div>
            </div>
            <ElasticSlider
              label="Volume"
              value={volume}
              onValueChange={setVolume}
              className="[--background:oklch(0.215_0.018_58)] [--foreground:oklch(0.975_0.012_84)] [--muted:oklch(1_0_0/14%)] [--primary:oklch(0.78_0.16_128)]"
            />
          </div>
        </div>
      </section>

      <section className="component-section">
        <div className="component-copy">
          <p className="component-number">03 / Tactile controls</p>
          <h2>Hold Button</h2>
          <p>
            Hold to confirm an action that deserves a second thought. Releasing
            early cancels it. Keyboard and assistive technology users can press
            once.
          </p>
          <InstallCommand name="hold-button" />
          <Link className="detail-link" href="/docs/components/hold-button">
            Preview, API, and source
          </Link>
        </div>
        <div className="demo-frame">
          <div className="demo-content hold-demo">
            {removed ? (
              <>
                <span className="bg-accent text-accent-foreground flex size-14 items-center justify-center rounded-full">
                  <Check aria-hidden="true" size={24} />
                </span>
                <p className="font-semibold">Download removed</p>
                <p className="restored-message">
                  The demo is ready to use again.
                </p>
                <button
                  className="restore-button"
                  type="button"
                  onClick={() => setRemoved(false)}
                >
                  <RotateCcw
                    aria-hidden="true"
                    className="mr-2 inline"
                    size={15}
                  />
                  Restore demo
                </button>
              </>
            ) : (
              <>
                <p className="restored-message">Release early to cancel.</p>
                <HoldButton
                  aria-label="Remove download"
                  onComplete={() => setRemoved(true)}
                >
                  Hold to remove download
                </HoldButton>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="component-section">
        <div className="component-copy">
          <p className="component-number">04 / Layout</p>
          <h2>Signature Footer</h2>
          <p>
            A useful closing section with one strong final gesture. Put the
            links first, then let the oversized wordmark sign off.
          </p>
          <InstallCommand name="signature-footer" />
          <Link
            className="detail-link"
            href="/docs/components/signature-footer"
          >
            Preview, API, and source
          </Link>
        </div>
        <div className="demo-frame p-4 md:p-8">
          <SignatureFooter
            className="w-full rounded-[var(--radius)] [&_[data-slot=signature-footer-heading]]:text-[clamp(2.5rem,5vw,4.5rem)] [&_[data-slot=signature-footer-inner]]:px-6 [&_[data-slot=signature-footer-inner]]:pt-8 [&_[data-slot=signature-footer-meta]]:mt-8 [&_[data-slot=signature-footer-navigation]]:hidden [&_[data-slot=signature-footer-wordmark]]:pt-4 [&_[data-slot=signature-footer-wordmark]]:text-[clamp(4rem,10vw,8rem)]"
            eyebrow="One last useful thought"
            heading="Make the ending memorable."
            description="Keep the links practical. Let the wordmark do the rest."
            brand={<strong>Northstar</strong>}
            meta={<span className="text-background/55">Made with care.</span>}
            wordmark="Northstar"
          />
        </div>
      </section>

      <section className="component-section">
        <div className="component-copy">
          <p className="component-number">05 / Playful extras</p>
          <h2>Impossible Checkbox</h2>
          <p>
            Try to turn it on. The bear has other plans. Keep this one for
            demos, Easter eggs, and preferences that do not matter.
          </p>
          <InstallCommand name="impossible-checkbox" />
          <Link
            className="detail-link"
            href="/docs/components/impossible-checkbox"
          >
            Preview, API, and source
          </Link>
        </div>
        <div className="demo-frame">
          <ImpossibleCheckbox className="bg-[#947cb0] [--impossible-bear:#784421] [--impossible-features:#16110e] [--impossible-muzzle:#e9c6af]" />
        </div>
      </section>

      <section className="component-section">
        <div className="component-copy">
          <p className="component-number">06 / Wayfinding</p>
          <h2>Floating Index</h2>
          <p>
            A small outline that stays nearby on long pages. It tracks the
            active section, shows reading progress, and opens when you need to
            jump.
          </p>
          <InstallCommand name="floating-index" />
          <Link className="detail-link" href="/docs/components/floating-index">
            Preview, API, and source
          </Link>
        </div>
        <div className="demo-frame">
          <FloatingIndexDemo />
        </div>
      </section>

      <section className="component-section">
        <div className="component-copy">
          <p className="component-number">07 / Actions</p>
          <h2>Shift Button</h2>
          <p>
            A call to action that clears a path as you approach it. The leading
            icon steps aside and a directional cue takes its place.
          </p>
          <InstallCommand name="shift-button" />
          <Link className="detail-link" href="/docs/components/shift-button">
            Preview, API, and source
          </Link>
        </div>
        <div className="demo-frame">
          <ShiftButton leadingIcon={<Apple aria-hidden="true" />}>
            Download for Mac
          </ShiftButton>
        </div>
      </section>

      <section className="component-section">
        <div className="component-copy">
          <p className="component-number">08 / Block</p>
          <h2>Image Gallery</h2>
          <p>
            A responsive collection with two useful layouts and a proper
            lightbox. Arrow keys move through the set and focus returns when you
            close it.
          </p>
          <InstallCommand name="image-gallery" />
          <Link className="detail-link" href="/docs/components/image-gallery">
            Preview, API, and source
          </Link>
        </div>
        <div className="demo-frame items-start">
          <ImageGalleryDemo />
        </div>
      </section>
    </div>
  )
}
