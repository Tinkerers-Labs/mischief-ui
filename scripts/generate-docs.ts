import { mkdir, rm, writeFile } from "node:fs/promises"
import path from "node:path"

import { componentDocs } from "../lib/component-docs"
import { componentMarkdown } from "../lib/component-markdown"
import { llmsFull, llmsIndex } from "../lib/llms-txt"
import { siteConfig } from "../site.config"

const publicDir = path.join(process.cwd(), "public")

async function write(route: string, contents: string) {
  const target = path.join(publicDir, route.replace(/^\//, ""))

  await mkdir(path.dirname(target), { recursive: true })
  await writeFile(target, contents.endsWith("\n") ? contents : `${contents}\n`)
}

async function main() {
  // Generated output only, so a removed component cannot leave a page behind.
  await rm(path.join(publicDir, "md"), { force: true, recursive: true })
  await rm(path.join(publicDir, "docs"), { force: true, recursive: true })

  for (const component of componentDocs) {
    const markdown = componentMarkdown(component)

    await write(siteConfig.markdown.path(component.slug), markdown)
    await write(siteConfig.markdown.legacyPath(component.slug), markdown)
  }

  await write(siteConfig.markdown.index, llmsIndex())
  await write(siteConfig.markdown.full, llmsFull())

  console.log(
    `docs: ${componentDocs.length} components at two addresses, plus llms.txt and llms-full.txt`
  )
}

await main()
