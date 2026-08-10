import { createHash } from "node:crypto"

import { readMischiefSkill } from "@/lib/skill-endpoint"
import { siteConfig } from "@/site.config"

export const dynamic = "force-static"

export async function GET() {
  const skill = await readMischiefSkill()
  const digest = createHash("sha256").update(skill).digest("hex")

  return Response.json(
    {
      $schema: "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
      skills: [
        {
          name: siteConfig.skill.name,
          type: "skill-md",
          description:
            "Find, evaluate, and install playful React components from Mischief into shadcn projects.",
          url: "/.well-known/agent-skills/mischief-ui/SKILL.md",
          digest: `sha256:${digest}`,
        },
      ],
    },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=300",
      },
    }
  )
}
