import type { MetadataRoute } from "next"

import { componentDocs } from "@/lib/component-docs"
import { siteConfig } from "@/site.config"

export const dynamic = "force-static"

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "docs/", "brand/", "license/"]
  const componentPages = componentDocs.map(
    ({ slug }) => `docs/components/${slug}/`
  )

  return [...pages, ...componentPages].map((path) => ({
    url: new URL(path, siteConfig.url).toString(),
    changeFrequency: path.startsWith("docs/components/") ? "monthly" : "weekly",
  }))
}
