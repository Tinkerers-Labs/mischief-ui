import { readFile } from "node:fs/promises"
import { join } from "node:path"

const skillDir = join(process.cwd(), "skills/mischief-ui")

export function readMischiefSkill() {
  return readFile(join(skillDir, "SKILL.md"), "utf8")
}

/** The catalog the skill points at, for an agent given the URL rather than the
 * installed directory. */
export function readMischiefSkillReference() {
  return readFile(join(skillDir, "reference.md"), "utf8")
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
