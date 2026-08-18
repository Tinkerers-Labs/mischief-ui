"use client"

import { DemoVariants } from "@/components/demos/demo-variants"
import { CodeBlock } from "@/registry/default/code-block/code-block"

const source = `import { rateLimit } from "./limiter"

export async function POST(request: Request) {
  const allowed = await rateLimit(request)

  if (!allowed) {
    return Response.json({ error: "Slow down" }, { status: 429 })
  }

  const body = await request.json()
  return Response.json({ ok: true, body })
}`

export function CodeBlockDemo() {
  return (
    <DemoVariants
      label="Code block"
      variants={[
        {
          id: "plain",
          label: "Plain",
          render: () => <CodeBlock code={source} filename="route.ts" />,
        },
        {
          id: "numbered",
          label: "Numbered",
          render: () => (
            <CodeBlock
              code={source}
              filename="route.ts"
              showLineNumbers
              highlightLines={[6, 7]}
            />
          ),
        },
        {
          id: "collapsed",
          label: "Collapsed",
          render: () => (
            <CodeBlock
              code={source}
              filename="route.ts"
              showLineNumbers
              maxLines={5}
              wrappable
            />
          ),
        },
      ]}
    />
  )
}
