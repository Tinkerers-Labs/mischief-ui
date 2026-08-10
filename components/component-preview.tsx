"use client"

import * as React from "react"
import { Check, RotateCcw, Volume2 } from "lucide-react"

import { ElasticSlider } from "@/registry/default/elastic-slider/elastic-slider"
import { HoldButton } from "@/registry/default/hold-button/hold-button"
import { MagneticTabs } from "@/registry/default/magnetic-tabs/magnetic-tabs"

const tabItems = [
  {
    value: "overview",
    label: "Overview",
    content: (
      <p>
        <strong>Everything important is close by.</strong>
        <br />
        <span className="text-muted-foreground">
          Your download is ready and notifications are on.
        </span>
      </p>
    ),
  },
  {
    value: "activity",
    label: "Activity",
    content: (
      <p>
        <strong>Two files finished downloading.</strong>
        <br />
        <span className="text-muted-foreground">
          Nothing needs your attention right now.
        </span>
      </p>
    ),
  },
  {
    value: "settings",
    label: "Settings",
    content: (
      <p>
        <strong>Notifications are on.</strong>
        <br />
        <span className="text-muted-foreground">
          We will only tell you when it matters.
        </span>
      </p>
    ),
  },
]

export function ComponentPreview({ slug }: { slug: string }) {
  const [volume, setVolume] = React.useState(68)
  const [removed, setRemoved] = React.useState(false)

  if (slug === "magnetic-tabs") {
    return (
      <div className="demo-content">
        <MagneticTabs items={tabItems} />
      </div>
    )
  }

  if (slug === "elastic-slider") {
    return (
      <div className="demo-content slider-demo">
        <div className="preview-heading">
          <span className="preview-icon">
            <Volume2 aria-hidden="true" size={20} />
          </span>
          <div>
            <strong>Notification volume</strong>
            <p>Changes play immediately.</p>
          </div>
        </div>
        <ElasticSlider
          label="Volume"
          value={volume}
          onValueChange={setVolume}
          className="[--background:oklch(0.215_0.018_58)] [--foreground:oklch(0.975_0.012_84)] [--muted:oklch(1_0_0/14%)] [--primary:oklch(0.78_0.16_128)]"
        />
      </div>
    )
  }

  return (
    <div className="demo-content hold-demo">
      {removed ? (
        <>
          <span className="complete-icon">
            <Check aria-hidden="true" size={24} />
          </span>
          <strong>Download removed</strong>
          <button
            className="restore-button"
            type="button"
            onClick={() => setRemoved(false)}
          >
            <RotateCcw aria-hidden="true" size={15} /> Restore demo
          </button>
        </>
      ) : (
        <>
          <p className="restored-message">Release early to cancel.</p>
          <HoldButton onComplete={() => setRemoved(true)}>
            Hold to remove download
          </HoldButton>
        </>
      )}
    </div>
  )
}
