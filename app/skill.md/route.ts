import { markdownResponse, readMischiefSkill } from "@/lib/skill-endpoint"

export const dynamic = "force-static"

export async function GET() {
  return markdownResponse(await readMischiefSkill())
}
