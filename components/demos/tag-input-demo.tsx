"use client"

import * as React from "react"
import { TagInput } from "@/registry/default/tag-input/tag-input"

export function TagInputDemo() {
  const [tags, setTags] = React.useState(["design", "typescript"])

  return (
    <div className="w-full max-w-md">
      <TagInput
        value={tags}
        onChange={setTags}
        max={6}
        label="Topics"
        placeholder="Add a topic"
      />
      <p className="text-muted-foreground mt-2 text-xs">
        Enter or a comma adds one. Backspace on an empty field takes the last
        one back.
      </p>
    </div>
  )
}
