import { readFileSync } from "node:fs"
import path from "node:path"

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

/** The tomato the mark is drawn in, everywhere the brand owns the surface. */
const BRAND = "#e5532d"

/**
 * The mark, on one line, drawn in the directory's own foreground colour rather
 * than in ours. The listing is somebody else's page in somebody else's theme,
 * and a row of logos reads as a row when they all take its colour. The brand
 * asset itself stays tomato: it is used in the readme and on the brand page,
 * where a custom property would resolve to nothing.
 *
 * The intrinsic size goes on too. Our asset carries only a viewBox, which
 * leaves an <img> to fall back on 300x150 and a row of logos ragged.
 */
function markSvg() {
  const file = path.join(process.cwd(), "public/brand/mischief-mark.svg")

  return readFileSync(file, "utf8")
    .replace("<svg ", "<svg width='24' height='24' ")
    .replaceAll(BRAND, "var(--foreground)")
    .replace(/\s*\n\s*/g, " ")
    .replace(/"/g, "'")
    .trim()
}

export function directoryEntry(): DirectoryEntry {
  return {
    name: siteConfig.registry.namespace,
    homepage: siteConfig.url.replace(/\/$/, ""),
    url: siteConfig.registry.url,
    // No count. This text is copied into somebody else's repository, where it
    // cannot be regenerated: the entry opened at ninety-four was stale within
    // a day of being written.
    description: `Playful, accessible React components for shadcn projects: an agent's chat surface, document viewers, a data table, and WebGL backdrops that read their colours from your theme.`,
    logo: markSvg(),
  }
}
