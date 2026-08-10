import { readFile } from "node:fs/promises"
import { join } from "node:path"

const skillPath = join(process.cwd(), "skills/mischief-ui/SKILL.md")

export function readMischiefSkill() {
  return readFile(skillPath, "utf8")
}

export function markdownResponse(content: string) {
  return new Response(content, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=300",
      "Content-Type": "text/markdown; charset=utf-8",
    },
  })
}
