"use client"

import { Metaballs } from "@/registry/default/metaballs/metaballs"

export function MetaballsDemo() {
  return (
    <Metaballs
      count={5}
      radius={0.11}
      className="border-border w-full max-w-xl rounded-[var(--radius)] border"
    >
      <div className="px-8 py-20 text-center">
        <h3 className="text-3xl font-semibold">Gooey</h3>
      </div>
    </Metaballs>
  )
}
