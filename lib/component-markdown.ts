import { packageManagers, runCommand } from "@/lib/package-commands"
import type { ComponentDoc } from "@/lib/component-docs"
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
      ? component.dependencies.map((entry) => `- ${entry}`).join("\n")
      : "None beyond React and the shared `cn` helper."

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

## API

${table(component.props)}

## Accessibility

${component.accessibility}

## Dependencies

${dependencies}

---

${siteConfig.name} UI · ${siteConfig.url} · ${siteConfig.license.name} licensed
`
}
