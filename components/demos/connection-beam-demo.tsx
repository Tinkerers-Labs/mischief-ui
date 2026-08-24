"use client"

import * as React from "react"
import { Braces, Bot, Database, FileText, Globe } from "lucide-react"

import { ConnectionBeam } from "@/registry/default/connection-beam/connection-beam"

function Node({
  icon,
  label,
  ref: nodeRef,
}: {
  icon: React.ReactNode
  label: string
  ref: React.RefObject<HTMLDivElement | null>
}) {
  return (
    <div
      ref={nodeRef}
      className="border-border bg-background text-muted-foreground z-10 flex size-11 items-center justify-center rounded-full border shadow-sm"
      title={label}
    >
      {icon}
      <span className="sr-only">{label}</span>
    </div>
  )
}

export function ConnectionBeamDemo() {
  const container = React.useRef<HTMLDivElement>(null)
  const agent = React.useRef<HTMLDivElement>(null)
  const docs = React.useRef<HTMLDivElement>(null)
  const db = React.useRef<HTMLDivElement>(null)
  const web = React.useRef<HTMLDivElement>(null)
  const out = React.useRef<HTMLDivElement>(null)

  return (
    <div
      ref={container}
      className="relative flex w-full max-w-lg items-center justify-between gap-6 p-6"
    >
      <div className="flex flex-col gap-6">
        <Node ref={docs} icon={<FileText size={17} />} label="Documents" />
        <Node ref={db} icon={<Database size={17} />} label="Database" />
        <Node ref={web} icon={<Globe size={17} />} label="Web search" />
      </div>

      <Node ref={agent} icon={<Bot size={19} />} label="Agent" />

      <Node ref={out} icon={<Braces size={17} />} label="Structured output" />

      <ConnectionBeam
        containerRef={container}
        fromRef={docs}
        toRef={agent}
        curvature={-24}
      />
      <ConnectionBeam
        containerRef={container}
        fromRef={db}
        toRef={agent}
        curvature={0}
        delay={0.6}
      />
      <ConnectionBeam
        containerRef={container}
        fromRef={web}
        toRef={agent}
        curvature={24}
        delay={1.2}
      />
      <ConnectionBeam
        containerRef={container}
        fromRef={agent}
        toRef={out}
        curvature={0}
        delay={1.8}
        beamColor="--chart-2"
      />
    </div>
  )
}
