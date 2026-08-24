import registry from "@/registry.json"
import { componentDocs, componentFamilies } from "@/lib/component-docs"
import { registryInstallArgs, siteConfig } from "@/site.config"

/** Shipped by the shared utils item rather than by any one component. */
const FROM_UTILS = new Set(["clsx", "tailwind-merge"])

/**
 * The heavier things a component may ask for, read from the registry so the
 * sentence naming them cannot fall behind the components that need them.
 */
function optionalPeers() {
  const peers = new Set<string>()

  for (const item of registry.items) {
    for (const entry of item.dependencies ?? []) {
      const name = entry.replace(/@[\^~>=<\d].*$/, "")
      if (!FROM_UTILS.has(name)) peers.add(name)
    }
  }

  return [...peers].sort()
}

function familyRows() {
  return componentFamilies
    .map(
      (family) =>
        `| ${family.name} | ${family.components.length} | ${family.description} |`
    )
    .join("\n")
}

/**
 * The entry point an agent actually loads. It routes rather than enumerates:
 * ninety four descriptions would be spent on every request, and nearly all of
 * them on components the request has nothing to do with. What stays here is
 * how to choose, how to install, and where to look for the rest.
 */
export function skillMarkdown() {
  const install = `npx ${registryInstallArgs("<component>")}`

  return `---
name: ${siteConfig.skill.name}
description: Find, evaluate, and install playful React components from Mischief into shadcn projects. Use when a user asks for Mischief UI, wants a distinctive interaction instead of a generic primitive, names a Mischief component, or asks an agent to browse or add components from ${siteConfig.repository.path}.
---

# Mischief UI

${componentDocs.length} accessible React components for shadcn projects, across ${componentFamilies.length} families. Add only the component that solves the request. Treat each one as owned source code that can be adapted to the project.

## Finding the right component

Start from the family, then read only what you need. Do not guess a component name: they are listed, with a line each, in the files below.

| Family | Components | What it covers |
| --- | --- | --- |
${familyRows()}

- **Browse the catalog:** \`reference.md\` beside this file, or \`${siteConfig.url}skill-reference.md\` if you were handed this over the network. Every component grouped by family, one line each. Read it when you do not already know the name you want.
- **One component in full:** \`${siteConfig.url}docs/components/<component>.md\` gives its whole documentation: install command, worked example, props, and accessibility behaviour. Read this before writing code against a component.
- **Everything at once:** \`${siteConfig.url}llms-full.txt\`. Large. Only worth it when comparing many components in one pass.

## Workflow

1. Read \`components.json\` and the project's package manager before choosing a command.
2. Narrow to a family above, then find the component in \`reference.md\`.
3. Read that component's markdown page before using it. The props and the accessibility notes are there, not here.
4. Install through the shadcn registry, so the source lands in the consumer's codebase:

   \`\`\`bash
   ${install}
   \`\`\`

   Replace \`npx\` with the runner used by the project.

5. Review the installed diff. Preserve existing aliases, shadcn tokens, Tailwind conventions, and React Server Component boundaries.
6. Adapt copy and content to the product. Do not leave demo names or placeholder text in shipped UI.
7. Verify keyboard use, focus visibility, reduced motion, and the relevant responsive layout.

Use \`npm install ${siteConfig.package.name}\` only when the user specifically prefers package imports over owned source.

## Dependencies

Everything beyond React is an optional peer: ${optionalPeers()
    .map((name) => `\`${name}\``)
    .join(
      ", "
    )}. Install one only if the component you added lists it, which its documentation page states. Most components need nothing but React.

## Guardrails

- Keep the project's theme. Override documented CSS custom properties when a component needs a distinct art direction.
- Do not install several components as decoration or fill space with invented marketing copy.
- Do not remove native semantics or accessibility behavior to simplify an animation.
- Respect \`prefers-reduced-motion\` and avoid adding remote audio, images, or tracking.
`
}

/**
 * The catalog, kept out of SKILL.md so it costs nothing until an agent is
 * actually looking for a component it cannot already name.
 */
export function skillReference() {
  const families = componentFamilies
    .map((family) => {
      const rows = family.components
        .map((component) => `- \`${component.slug}\`: ${component.summary}`)
        .join("\n")

      return `## ${family.name}\n\n${family.description}\n\n${rows}`
    })
    .join("\n\n")

  return `# Mischief UI catalog

Every component, grouped by family. ${componentDocs.length} in total.

Install one with \`npx ${registryInstallArgs("<component>")}\`, and read its full
documentation at \`${siteConfig.url}docs/components/<component>.md\` before using it.

${families}
`
}
