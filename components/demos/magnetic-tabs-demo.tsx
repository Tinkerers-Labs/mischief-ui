"use client"

import { MagneticTabs } from "@/registry/default/magnetic-tabs/magnetic-tabs"

const items = [
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

export function MagneticTabsDemo() {
  return (
    <div className="demo-content">
      <MagneticTabs items={items} />
    </div>
  )
}
