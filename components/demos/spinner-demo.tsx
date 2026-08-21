"use client"

import { Spinner } from "@/registry/default/spinner/spinner"

export function SpinnerDemo() {
  return (
    <div className="flex flex-wrap items-center gap-8">
      <Spinner size={14} />
      <Spinner size={20} />
      <span className="text-muted-foreground inline-flex items-center gap-2 text-sm">
        <Spinner size={14} />
        Checking the registry
      </span>
      <button
        type="button"
        disabled
        className="border-border inline-flex min-h-9 items-center gap-2 rounded-full border px-3 text-sm opacity-70"
      >
        <Spinner size={13} label="Publishing" />
        Publishing
      </button>
    </div>
  )
}
