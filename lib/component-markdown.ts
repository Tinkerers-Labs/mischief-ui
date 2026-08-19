import { packageManagers, runCommand } from "@/lib/package-commands"
import type {
  ComponentDoc,
  DocBlock,
  DocSection,
  DocTypeTable,
} from "@/lib/component-docs"
import {
  componentSourceUrl,
  registryInstallArgs,
  siteConfig,
} from "@/site.config"

function table(rows: readonly (readonly [string, string, string])[]) {
  return [
    "| Prop | Type | Description |",
    "| --- | --- | --- |",
    ...rows.map(
      ([name, type, description]) =>
        `| \`${name}\` | \`${type}\` | ${description} |`
    ),
  ].join("\n")
}

function blockToMarkdown(block: DocBlock) {
  switch (block.kind) {
    case "text":
      return block.text

    case "code":
      return [
        "```tsx",
        block.code,
        "```",
        ...(block.caption ? ["", block.caption] : []),
      ].join("\n")

    case "list":
      return block.items.map((item) => `- ${item}`).join("\n")

    case "table":
      return [
        `| ${block.headers.join(" | ")} |`,
        `| ${block.headers.map(() => "---").join(" | ")} |`,
        ...block.rows.map((row) => `| ${row.join(" | ")} |`),
      ].join("\n")
  }
}

function sectionsToMarkdown(sections: readonly DocSection[]) {
  if (sections.length === 0) return ""

  return `\n${sections
    .map(
      (section) =>
        `## ${section.title}\n\n${section.blocks
          .map(blockToMarkdown)
          .join("\n\n")}`
    )
    .join("\n\n")}\n`
}

function typesToMarkdown(types: readonly DocTypeTable[]) {
  if (types.length === 0) return ""

  return `\n${types
    .map(
      (entry) =>
        `### ${entry.name}\n\n${
          entry.description ? `${entry.description}\n\n` : ""
        }${table(entry.rows)}`
    )
    .join("\n\n")}\n`
}

/**
 * The markdown served at each component's `.md` address and copied by the page
 * menu. It is generated from the same entry the page renders, so the two cannot
 * describe the component differently.
 */
export function componentMarkdown(component: ComponentDoc) {
  const pageUrl = new URL(
    `/docs/components/${component.slug}`,
    siteConfig.url
  ).toString()

  const install = packageManagers
    .map(
      (manager) =>
        `${manager}: \`${runCommand(manager, registryInstallArgs(component.slug))}\``
    )
    .join("\n")

  const dependencies =
    component.dependencies.length > 0
      ? `\n## Dependencies\n\n${component.dependencies
          .map((entry) => `- ${entry}`)
          .join("\n")}\n`
      : ""

  return `# ${component.name}

${component.summary}

- Family: ${component.family}
- Kind: ${component.kind}
- Page: ${pageUrl}
- Source: ${componentSourceUrl(component.slug)}

## Install

${install}

Or as a package import:

\`\`\`ts
${component.npmImport}
\`\`\`

## Usage

\`\`\`tsx
${component.usage}
\`\`\`
${sectionsToMarkdown(component.sections)}
## API

${table(component.props)}
${typesToMarkdown(component.types)}

## Accessibility

${component.accessibility}
${dependencies}
---

${siteConfig.name} UI · ${siteConfig.url} · ${siteConfig.license.name} licensed
`
}
