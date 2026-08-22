"use client"

import * as React from "react"
import { RenderSurface } from "@/registry/default/render-surface/render-surface"

type Dot = { x: number; y: number; vx: number; vy: number }

export function RenderSurfaceDemo() {
  const setup = ({ size }: { size: { width: number; height: number } }) =>
    Array.from({ length: 24 }, (_, index) => ({
      x: (index * 37) % size.width,
      y: (index * 53) % size.height,
      vx: 40 + (index % 5) * 14,
      vy: 30 + (index % 7) * 11,
    }))

  const draw = ({
    context,
    size,
    state,
    delta,
  }: {
    context: CanvasRenderingContext2D
    size: { width: number; height: number; dpr: number }
    state: Dot[]
    delta: number
  }) => {
    context.setTransform(size.dpr, 0, 0, size.dpr, 0, 0)
    context.clearRect(0, 0, size.width, size.height)
    context.fillStyle = getComputedStyle(context.canvas).color

    for (const dot of state) {
      dot.x += dot.vx * delta
      dot.y += dot.vy * delta

      if (dot.x < 0 || dot.x > size.width) dot.vx *= -1
      if (dot.y < 0 || dot.y > size.height) dot.vy *= -1

      context.beginPath()
      context.arc(dot.x, dot.y, 3, 0, Math.PI * 2)
      context.fill()
    }
  }

  return (
    <RenderSurface<Dot[], "2d">
      setup={setup}
      draw={draw}
      label="Twenty four dots drifting inside a panel"
      className="text-primary border-border bg-card h-56 w-full max-w-xl rounded-[var(--radius)] border"
    />
  )
}
