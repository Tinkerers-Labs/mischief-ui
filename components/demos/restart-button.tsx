"use client"

import { RotateCcw } from "lucide-react"

export function RestartButton({ onClick }: { onClick: () => void }) {
  return (
    <button className="restore-button" type="button" onClick={onClick}>
      <RotateCcw aria-hidden="true" size={15} /> Replay
    </button>
  )
}
