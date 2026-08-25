"use client"

import * as React from "react"

import { DemoVariants } from "@/components/demos/demo-variants"
import { Orb, type OrbState } from "@/registry/default/orb/orb"

const states: OrbState[] = ["idle", "listening", "thinking", "speaking"]

function Live({ state }: { state: OrbState }) {
  const [level, setLevel] = React.useState(0)

  React.useEffect(() => {
    if (state !== "listening" && state !== "speaking") return

    // A stand-in for a real level, so the demo shows what one looks like.
    const timer = setInterval(() => setLevel(0.25 + Math.random() * 0.7), 140)
    return () => clearInterval(timer)
  }, [state])

  return <Orb state={state} level={level} size={140} />
}

export function OrbDemo() {
  return (
    <DemoVariants
      label="State"
      variants={
        states.map((state) => ({
          id: state,
          label: state,
          render: () => <Live state={state} />,
        })) as [
          { id: string; label: string; render: () => React.ReactNode },
          ...{ id: string; label: string; render: () => React.ReactNode }[],
        ]
      }
    />
  )
}
