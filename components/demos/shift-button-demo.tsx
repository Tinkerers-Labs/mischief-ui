"use client"

import { Apple } from "lucide-react"

import { ShiftButton } from "@/registry/default/shift-button/shift-button"

export function ShiftButtonDemo() {
  return (
    <ShiftButton leadingIcon={<Apple aria-hidden="true" />}>
      Download for Mac
    </ShiftButton>
  )
}
