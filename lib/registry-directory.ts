import { readFileSync } from "node:fs"
import path from "node:path"

import { componentDocs } from "@/lib/component-docs"
import { siteConfig } from "@/site.config"

/**
 * The entry shadcn's directory expects, built from the same configuration the
 * site uses so the submission cannot describe a registry we do not serve.
 * Their validator is a Zod schema; `test/registry-directory.test.ts` holds this
 * to the same rules before it ever reaches a pull request.
 */
export type DirectoryEntry = {
  name: string
  homepage: string
  url: string
  description: string
  logo: string
}

/** The brand mark, on one line, as the directory stores it. */
function markSvg() {
  const file = path.join(process.cwd(), "public/brand/mischief-mark.svg")

  return readFileSync(file, "utf8")
    .replace(/\s*\n\s*/g, " ")
    .replace(/"/g, "'")
    .trim()
}

export function directoryEntry(): DirectoryEntry {
  return {
    name: siteConfig.registry.namespace,
    homepage: siteConfig.url.replace(/\/$/, ""),
    url: siteConfig.registry.url,
    description: `${componentDocs.length} playful, accessible React components for shadcn projects: an agent's chat surface, document viewers, a data table, and backdrops that take their colours from your theme rather than bringing their own.`,
    logo: markSvg(),
  }
}
