"use client"

import * as React from "react"
import { ScrollScene } from "@/registry/default/scroll-scene/scroll-scene"

export function ScrollSceneDemo() {
  const box = React.useRef<HTMLDivElement>(null)
  const readout = React.useRef<HTMLParagraphElement>(null)

  return (
    <div className="border-border h-72 w-full max-w-md overflow-y-auto rounded-[var(--radius)] border">
      <div className="text-muted-foreground grid h-40 place-items-center text-xs">
        Scroll down inside this panel
      </div>

      <ScrollScene
        className="h-[36rem]"
        onProgress={(progress) => {
          // Written straight to the nodes. A scene driven by scrolling must
          // not render the page sixty times a second.
          if (box.current) {
            box.current.style.transform = `rotate(${progress * 180}deg) scale(${0.6 + progress * 0.6})`
          }
          if (readout.current) {
            readout.current.textContent = `${Math.round(progress * 100)} percent`
          }
        }}
      >
        <div className="sticky top-0 grid h-72 place-content-center justify-items-center gap-4">
          <div
            ref={box}
            className="bg-primary size-24 rounded-[var(--radius)]"
          />
          <p
            ref={readout}
            className="text-muted-foreground text-xs tabular-nums"
          >
            0 percent
          </p>
        </div>
      </ScrollScene>

      <div className="text-muted-foreground grid h-40 place-items-center text-xs">
        And back up again
      </div>
    </div>
  )
}
