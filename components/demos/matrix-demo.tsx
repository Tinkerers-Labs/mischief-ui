"use client"

import * as React from "react"

import { Matrix } from "@/registry/default/matrix/matrix"

export function MatrixDemo() {
  const [level, setLevel] = React.useState(0.3)

  React.useEffect(() => {
    const timer = setInterval(() => setLevel(0.2 + Math.random() * 0.75), 160)
    return () => clearInterval(timer)
  }, [])

  return <Matrix className="h-32 w-full max-w-md" level={level} columns={28} />
}
