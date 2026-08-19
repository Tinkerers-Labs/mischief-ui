import { componentDocs, componentFamilies } from "@/lib/component-docs"
import { componentMarkdown } from "@/lib/component-markdown"
import { siteConfig } from "@/site.config"

/**
 * The two files at llmstxt.org's addresses: an index a model can scan to find
 * the one component it needs, and everything at once for when it cannot fetch
 * a second time.
 */
export const markdownRoute = (slug: string) => siteConfig.markdown.path(slug)

const absolute = (route: string) => new URL(route, siteConfig.url).toString()

export function llmsIndex() {
  const families = componentFamilies
    .map(
      (family) =>
        `## ${family.name}\n\n${family.description}\n\n${family.components
          .map(
            (component) =>
              `- [${component.name}](${absolute(markdownRoute(component.slug))}): ${component.summary}`
          )
          .join("\n")}`
    )
    .join("\n\n")

  return `# ${siteConfig.name} UI

> ${componentDocs.length} React components for AI and document interfaces, built with Tailwind CSS and shadcn theme tokens. Every component installs through the shadcn registry or from npm, and anything heavier than React is an optional peer.

Each link below is that component's whole documentation as markdown: what it does, how to install it, a worked example, the concerns particular to it, its props, and its accessibility behaviour.

- Install one component: \`npx shadcn@latest add ${siteConfig.repository.path}/{name}\`
- Or from npm: \`npm install ${siteConfig.package.name}\`, then \`import { X } from "${siteConfig.package.name}/{name}"\`
- Any page on the site is also markdown at the same address with \`.md\` appended.

${families}

## Optional

- [Everything in one file](${absolute(siteConfig.markdown.full)}): every component's documentation concatenated.
- [Agent skill](${siteConfig.skill.url}): instructions for installing components on someone's behalf.
- [Site](${siteConfig.url}): the same documentation, with live examples.
`
}

export function llmsFull() {
  return `# ${siteConfig.name} UI

> Every component's documentation, concatenated. ${componentDocs.length} components.

${componentDocs.map((component) => componentMarkdown(component)).join("\n---\n\n")}`
}
