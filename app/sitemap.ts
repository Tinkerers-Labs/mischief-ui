import type { MetadataRoute } from "next"

import { componentDocs, componentFamilies } from "@/lib/component-docs"
import { siteConfig } from "@/site.config"

export const dynamic = "force-static"

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    "",
    "docs/",
    "docs/installation/",
    "docs/components/",
    "docs/guidelines/",
    "docs/troubleshooting/",
    "ax/",
    "changelog/",
    "brand/",
    "license/",
  ]
  const componentPages = componentDocs.map(
    ({ slug }) => `docs/components/${slug}/`
  )
  const familyPages = componentFamilies.flatMap(({ slug }) => [
    `families/${slug}/`,
    `docs/families/${slug}/`,
  ])

  return [...pages, ...familyPages, ...componentPages].map((path) => ({
    url: new URL(path, siteConfig.url).toString(),
    changeFrequency: path.startsWith("docs/components/") ? "monthly" : "weekly",
  }))
}
