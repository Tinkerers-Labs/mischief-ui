import type { ComponentDoc } from "@/lib/component-docs"
import { siteConfig } from "@/site.config"

/**
 * The one wording used by both the install panel and the page menu, so an
 * agent is asked for the same thing wherever the prompt is copied from.
 */
export function agentInstallPrompt(component: ComponentDoc) {
  const markdownUrl = new URL(
    siteConfig.markdown.path(component.slug),
    siteConfig.url
  ).toString()

  return [
    `Read ${markdownUrl} and ${siteConfig.skill.url}.`,
    `Then add ${siteConfig.name}'s ${component.name} to this project with the shadcn CLI,`,
    "install the dependencies that page lists, and show me where it was placed.",
  ].join(" ")
}
