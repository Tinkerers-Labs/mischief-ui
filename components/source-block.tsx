"use client"

import { CodeBlock } from "@/registry/default/code-block/code-block"

/**
 * A whole file, rather than a snippet: named, collapsed, and copied in full.
 * Prose examples keep the plainer block above.
 */
export function SourceBlock({
  code,
  filename,
}: {
  code: string
  filename: string
}) {
  return (
    <CodeBlock
      className="mt-3"
      code={code}
      filename={filename}
      maxLines={14}
      showLineNumbers
      wrappable
    />
  )
}
