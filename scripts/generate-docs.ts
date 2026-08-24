import { mkdir, rm, writeFile } from "node:fs/promises"
import path from "node:path"

import { componentDocs } from "../lib/component-docs"
import { componentMarkdown } from "../lib/component-markdown"
import { llmsFull, llmsIndex } from "../lib/llms-txt"
import { skillMarkdown, skillReference } from "../lib/skill-file"
import { siteConfig } from "../site.config"

const publicDir = path.join(process.cwd(), "public")

async function write(route: string, contents: string) {
  const target = path.join(publicDir, route.replace(/^\//, ""))

  await mkdir(path.dirname(target), { recursive: true })
  await writeFile(target, contents.endsWith("\n") ? contents : `${contents}\n`)
}

async function main() {
  // Generated output only, so a removed component cannot leave a page behind.
  await rm(path.join(publicDir, "docs"), { force: true, recursive: true })

  for (const component of componentDocs) {
    await write(
      siteConfig.markdown.path(component.slug),
      componentMarkdown(component)
    )
  }

  await write(siteConfig.markdown.index, llmsIndex())
  await write(siteConfig.markdown.full, llmsFull())

  // The skill is generated for the same reason the pages are: a catalog kept
  // by hand falls behind the collection it describes, quietly.
  const skillDir = path.join(process.cwd(), "skills", siteConfig.skill.name)
  await mkdir(skillDir, { recursive: true })
  await writeFile(path.join(skillDir, "SKILL.md"), skillMarkdown())
  await writeFile(path.join(skillDir, "reference.md"), skillReference())

  console.log(
    `docs: ${componentDocs.length} component pages, llms.txt, llms-full.txt, and the skill`
  )
}

await main()
