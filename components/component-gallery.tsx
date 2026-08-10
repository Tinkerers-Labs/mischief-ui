"use client"

import * as React from "react"
import { Check, Clipboard, RotateCcw, Volume2 } from "lucide-react"

import { ElasticSlider } from "@/registry/default/elastic-slider/elastic-slider"
import { HoldButton } from "@/registry/default/hold-button/hold-button"
import { MagneticTabs } from "@/registry/default/magnetic-tabs/magnetic-tabs"

const owner = "Tinkerers-Labs/mischief"

function InstallCommand({ name }: { name: string }) {
  const [copied, setCopied] = React.useState(false)
  const command = `pnpm dlx shadcn@latest add ${owner}/${name}`

  async function copyCommand() {
    await navigator.clipboard.writeText(command)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1400)
  }

  return (
    <button className="install-command" onClick={copyCommand} type="button">
      <code>{command}</code>
      {copied ? (
        <Check aria-label="Copied" size={16} />
      ) : (
        <Clipboard aria-label="Copy command" size={16} />
      )}
    </button>
  )
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
    </div>
  )
}
