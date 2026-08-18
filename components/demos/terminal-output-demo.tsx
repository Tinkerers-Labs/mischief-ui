"use client"

import * as React from "react"

import { DemoVariants } from "@/components/demos/demo-variants"
import { RestartButton } from "@/components/demos/restart-button"
import {
  TerminalOutput,
  type TerminalLine,
} from "@/registry/default/terminal-output/terminal-output"

const script: TerminalLine[] = [
  { text: "Packages: +214" },
  { text: "Progress: resolved 214, reused 210, downloaded 4" },
  { text: "" },
  { text: "dependencies:" },
  { text: "+ mischief-ui 0.7.1" },
  { text: "" },
  { text: "Done in 1.8s" },
]

const failure: TerminalLine[] = [
  {
    text: "src/total.ts(4,17): error TS2554: Expected 1 arguments, but got 2.",
    stream: "stderr",
  },
  { text: "", stream: "stderr" },
  { text: "Found 1 error in src/total.ts", stream: "stderr" },
]

function LiveRun() {
  const [count, setCount] = React.useState(0)
  const [runId, setRunId] = React.useState(0)

  React.useEffect(() => {
    if (count >= script.length) return

    const timer = setTimeout(() => setCount((shown) => shown + 1), 420)
    return () => clearTimeout(timer)
  }, [count, runId])

  const done = count >= script.length

  return (
    <div className="grid gap-4">
      <TerminalOutput
        command="pnpm install mischief-ui"
        cwd="~/projects/shop"
        output={script.slice(0, count)}
        running={!done}
        exitCode={done ? 0 : undefined}
        maxHeight="11rem"
      />

      {done ? (
        <RestartButton
          onClick={() => {
            setCount(0)
            setRunId((id) => id + 1)
          }}
        />
      ) : null}
    </div>
  )
}

export function TerminalOutputDemo() {
  return (
    <DemoVariants
      label="Command run"
      variants={[
        { id: "live", label: "Streaming", render: () => <LiveRun /> },
        {
          id: "failed",
          label: "Failed",
          render: () => (
            <TerminalOutput
              command="pnpm typecheck"
              output={failure}
              exitCode={2}
              maxHeight="11rem"
            />
          ),
        },
      ]}
    />
  )
}
