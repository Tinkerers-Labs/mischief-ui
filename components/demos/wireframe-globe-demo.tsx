"use client"

import { WireframeGlobe } from "@/registry/default/wireframe-globe/wireframe-globe"

const markers = [
  { id: "lhr", lat: 51.47, lng: -0.45, label: "London" },
  { id: "jfk", lat: 40.64, lng: -73.78, label: "New York" },
  { id: "sin", lat: 1.36, lng: 103.99, label: "Singapore" },
  { id: "gru", lat: -23.43, lng: -46.47, label: "Sao Paulo" },
  { id: "blr", lat: 13.2, lng: 77.71, label: "Bengaluru" },
]

const arcs = [
  { from: markers[0]!, to: markers[1]! },
  { from: markers[0]!, to: markers[4]! },
  { from: markers[2]!, to: markers[4]! },
]

export function WireframeGlobeDemo() {
  return (
    <div className="w-full max-w-sm">
      <WireframeGlobe
        markers={markers}
        arcs={arcs}
        className="aspect-square w-full"
      />
      <p className="text-muted-foreground mt-2 text-center text-xs">
        Five regions. Drag to spin it.
      </p>
    </div>
  )
}
