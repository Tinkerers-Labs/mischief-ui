"use client"

import { SceneHero } from "@/registry/default/scene-hero/scene-hero"

export function SceneHeroDemo() {
  return (
    <SceneHero
      shape="torus-knot"
      className="border-border bg-card w-full max-w-xl overflow-hidden rounded-[var(--radius)] border"
    >
      <div className="flex min-h-80 flex-col justify-end p-8">
        <h3 className="text-3xl font-semibold">Built in the open</h3>
        <p className="text-muted-foreground mt-2 max-w-[12rem] text-sm">
          Steered by your pointer, coloured by your theme.
        </p>
      </div>
    </SceneHero>
  )
}
