"use client"

import { DemoVariants } from "@/components/demos/demo-variants"
import {
  ShaderSurface,
  type ShaderSurfaceVariant,
} from "@/registry/default/shader-surface/shader-surface"

const variants: ShaderSurfaceVariant[] = [
  "plasma",
  "caustics",
  "metal",
  "ripple",
]

function Panel({ variant }: { variant: ShaderSurfaceVariant }) {
  return (
    <ShaderSurface
      variant={variant}
      className="border-border mx-auto w-full max-w-xl rounded-[var(--radius)] border"
    >
      <div className="px-8 py-20 text-center">
        <h3 className="text-3xl font-semibold capitalize drop-shadow-sm">
          {variant}
        </h3>
      </div>
    </ShaderSurface>
  )
}

export function ShaderSurfaceDemo() {
  return (
    <DemoVariants
      label="Shader"
      variants={
        variants.map((variant) => ({
          id: variant,
          label: variant,
          render: () => <Panel variant={variant} />,
        })) as [
          { id: string; label: string; render: () => React.ReactNode },
          ...{ id: string; label: string; render: () => React.ReactNode }[],
        ]
      }
    />
  )
}
