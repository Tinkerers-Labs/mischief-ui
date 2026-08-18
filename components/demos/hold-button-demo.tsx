"use client"

import * as React from "react"
import { Check, RotateCcw } from "lucide-react"

import { HoldButton } from "@/registry/default/hold-button/hold-button"

export function HoldButtonDemo() {
  const [removed, setRemoved] = React.useState(false)

  return (
    <div className="demo-content hold-demo">
      {removed ? (
        <>
          <span className="complete-icon">
            <Check aria-hidden="true" size={24} />
          </span>
          <strong>Download removed</strong>
          <p className="restored-message">The demo is ready to use again.</p>
          <button
            className="restore-button"
            type="button"
            onClick={() => setRemoved(false)}
          >
            <RotateCcw aria-hidden="true" size={15} /> Restore demo
          </button>
        </>
      ) : (
        <>
          <p className="restored-message">Release early to cancel.</p>
          <HoldButton
            aria-label="Remove download"
            onComplete={() => setRemoved(true)}
          >
            Hold to remove download
          </HoldButton>
        </>
      )}
    </div>
  )
}
