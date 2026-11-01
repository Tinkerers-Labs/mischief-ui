"use client"

import * as React from "react"

import { RestartButton } from "@/components/demos/restart-button"
import { ToolCall } from "@/registry/default/tool-call/tool-call"
import {
  ToolApproval,
  type ToolApprovalDecision,
} from "@/registry/default/tool-approval/tool-approval"

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const readInput = { path: "src/app/settings/page.tsx", lines: "1-120" }
const deleteInput = { branch: "release/0.7", remote: "origin", force: false }

export function ToolApprovalDemo() {
  const [run, setRun] = React.useState(0)
  const [read, setRead] = React.useState<ToolApprovalDecision | null>(null)
  const [removal, setRemoval] = React.useState<ToolApprovalDecision | null>(
    null
  )

  return (
    <div className="grid w-full max-w-md gap-3" key={run}>
      <p className="text-muted-foreground text-sm">
        The agent is cleaning up after the 0.8 release.
      </p>

      <ToolApproval
        input={readInput}
        name="read_file"
        onDecision={async (decision) => {
          await wait(500)
          setRead(decision)
        }}
      />
      {read && read !== "deny" ? (
        <ToolCall
          durationMs={84}
          input={readInput}
          name="read_file"
          output={<p>120 lines read.</p>}
          status="success"
        />
      ) : null}

      <ToolApproval
        destructive
        input={deleteInput}
        name="delete_branch"
        summary={
          <p>
            Deletes <code>release/0.7</code> on origin. Anyone who has not
            pulled it loses the branch.
          </p>
        }
        onDecision={async (decision) => {
          await wait(500)
          setRemoval(decision)
        }}
      />
      {removal && removal !== "deny" ? (
        <ToolCall
          durationMs={1320}
          input={deleteInput}
          name="delete_branch"
          output={<p>Deleted release/0.7 on origin.</p>}
          status="success"
        />
      ) : null}

      {read && removal ? (
        <div className="flex justify-center pt-2">
          <RestartButton
            onClick={() => {
              setRead(null)
              setRemoval(null)
              setRun((value) => value + 1)
            }}
          />
        </div>
      ) : null}
    </div>
  )
}
