"use client"

import { AvatarStack } from "@/registry/default/avatar-stack/avatar-stack"

const people = [
  { id: "1", name: "Ada Lovelace" },
  { id: "2", name: "Grace Hopper" },
  { id: "3", name: "Alan Turing" },
  { id: "4", name: "Katherine Johnson" },
  { id: "5", name: "Radia Perlman" },
  { id: "6", name: "Barbara Liskov" },
]

export function AvatarStackDemo() {
  return (
    <div className="grid justify-items-center gap-3">
      <AvatarStack people={people} label="On this document" />
      <p className="text-muted-foreground text-xs">
        Point at the group and it fans out.
      </p>
    </div>
  )
}
