"use client"

import { Marquee } from "@/registry/default/marquee/marquee"

const shipped = [
  "Metaballs",
  "Aurora Field",
  "Dither Image",
  "Wireframe Globe",
  "Constellation Field",
  "Shader Surface",
  "ASCII Image",
  "Spotlight Card",
]

export function MarqueeDemo() {
  return (
    <div className="w-full max-w-xl">
      <Marquee duration={24} gap={12} pauseOnHover fade>
        {shipped.map((name) => (
          <span
            key={name}
            className="border-border bg-background text-muted-foreground inline-flex min-h-9 items-center rounded-full border px-4 text-xs font-semibold whitespace-nowrap"
          >
            {name}
          </span>
        ))}
      </Marquee>
    </div>
  )
}
