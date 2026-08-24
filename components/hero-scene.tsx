"use client"

import * as React from "react"
import Link from "next/link"

import { AuroraField } from "@/registry/default/aurora-field/aurora-field"
import { ConstellationField } from "@/registry/default/constellation-field/constellation-field"
import { GrainOverlay } from "@/registry/default/grain-overlay/grain-overlay"
import { Metaballs } from "@/registry/default/metaballs/metaballs"
import { ShaderSurface } from "@/registry/default/shader-surface/shader-surface"

type Backdrop = {
  id: string
  label: string
  slug: string
  render: () => React.ReactNode
}

const backdrops: Backdrop[] = [
  {
    id: "metaballs",
    label: "Metaballs",
    slug: "metaballs",
    render: () => (
      <Metaballs
        pointer
        count={5}
        radius={0.09}
        edge={0.16}
        speed={0.9}
        className="absolute inset-0"
      />
    ),
  },
  {
    id: "constellation",
    label: "Constellation",
    slug: "constellation-field",
    render: () => (
      <ConstellationField
        density={3}
        linkDistance={150}
        pointerRadius={240}
        speed={0.7}
        className="absolute inset-0"
      />
    ),
  },
  {
    id: "plasma",
    label: "Plasma",
    slug: "shader-surface",
    render: () => (
      <ShaderSurface
        variant="plasma"
        scale={2.2}
        className="absolute inset-0"
      />
    ),
  },
  {
    id: "caustics",
    label: "Caustics",
    slug: "shader-surface",
    render: () => (
      <ShaderSurface
        variant="caustics"
        scale={1.8}
        speed={0.55}
        className="absolute inset-0"
      />
    ),
  },
  {
    id: "aurora",
    label: "Aurora",
    slug: "aurora-field",
    render: () => <AuroraField className="absolute inset-0" blobs={6} />,
  },
]

/**
 * The whole hero stands on a component from the collection, drawn from the
 * same theme properties the rest of the page is using. Switching the theme
 * recolours it on the next frame, which is the argument made rather than
 * described.
 */
export function HeroScene({ children }: { children: React.ReactNode }) {
  const [activeId, setActiveId] = React.useState(backdrops[0]!.id)
  const active =
    backdrops.find((entry) => entry.id === activeId) ?? backdrops[0]!

  return (
    <section
      className="border-border relative isolate overflow-hidden border-b"
      id="top"
    >
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        {active.render()}
        <GrainOverlay opacity={0.17} />
        {/* Colour is left everywhere, and only calmed enough on the reading
            side for the copy to sit on it comfortably. */}
        <div className="from-background via-background/86 to-background/5 absolute inset-0 bg-gradient-to-r from-0% via-40%" />
      </div>

      <div className="mx-auto flex max-w-[90rem] flex-col justify-center px-4 py-16 md:px-8 md:py-20 lg:min-h-[38rem] lg:px-12 lg:py-24">
        <div className="flex max-w-[46rem] flex-col justify-center">
          {children}

          <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2">
            <div
              role="group"
              aria-label="Hero backdrop"
              className="border-border/70 bg-background/60 inline-flex flex-wrap gap-1 rounded-full border p-1 backdrop-blur-md"
            >
              {backdrops.map((backdrop) => (
                <button
                  key={backdrop.id}
                  type="button"
                  aria-pressed={backdrop.id === active.id}
                  onClick={() => setActiveId(backdrop.id)}
                  className={
                    backdrop.id === active.id
                      ? "bg-foreground text-background rounded-full px-3 py-1.5 text-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground rounded-full px-3 py-1.5 text-xs font-semibold"
                  }
                >
                  {backdrop.label}
                </button>
              ))}
            </div>

            <p className="text-muted-foreground text-xs">
              This backdrop is{" "}
              <Link
                className="hover:text-foreground underline underline-offset-4"
                href={`/docs/components/${active.slug}`}
              >
                a component
              </Link>
              , drawn from your theme.{" "}
              {active.id === "metaballs" || active.id === "constellation"
                ? "Move your pointer through it."
                : "Switch to dark and it follows."}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
