"use client"

import * as React from "react"
import { Volume2 } from "lucide-react"

import { ElasticSlider } from "@/registry/default/elastic-slider/elastic-slider"

export function ElasticSliderDemo() {
  const [volume, setVolume] = React.useState(68)

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
