import { componentMarkdown } from "@/lib/component-markdown"
import { componentDocs, getComponentDoc } from "@/lib/component-docs"
import { markdownResponse } from "@/lib/skill-endpoint"

export const dynamicParams = false

// The extension lives in the parameter value, because a route segment cannot
// be both dynamic and carry a suffix.
export function generateStaticParams() {
  return componentDocs.map((component) => ({ file: `${component.slug}.md` }))
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ file: string }> }
) {
  const { file } = await params
  const component = getComponentDoc(file.replace(/\.md$/, ""))

  if (!component) return new Response("Not found", { status: 404 })

  return markdownResponse(componentMarkdown(component))
}
