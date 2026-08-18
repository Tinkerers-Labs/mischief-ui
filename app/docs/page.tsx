import type { Metadata } from "next"
import Link from "next/link"

import { CopyCommand } from "@/components/copy-command"
import { componentDocs } from "@/lib/component-docs"
import { registryInstallCommand, siteConfig } from "@/site.config"

export const metadata: Metadata = {
  title: `Documentation | ${siteConfig.name}`,
  description:
    "Install Mischief UI components through the shadcn registry or npm, then adapt the source for your React project.",
  alternates: { canonical: "/docs" },
}

export default function DocsPage() {
  const components = componentDocs.filter(({ kind }) => kind === "component")
  const blocks = componentDocs.filter(({ kind }) => kind === "block")

  return (
    <article className="docs-article docs-intro">
      <p className="eyebrow">Introduction</p>
      <h1>
        Small collection.
        <br />
        High bar.
      </h1>
      <p className="docs-lead">
        {siteConfig.name} adds physical feedback and a little personality to
        familiar controls. Every component is open source, theme-aware, and
        usable with a keyboard, touch, pointer, or screen reader where
        applicable.
      </p>

      <section className="docs-section">
        <h2>Choose how you install</h2>
        <p>
          The shadcn registry copies source into your project, which is the
          recommended path. The npm package is useful when you want ordinary
          dependency updates or a quick look at the exported API.
        </p>
        <div className="install-options">
          <CopyCommand
            label="Source"
            command={registryInstallCommand("magnetic-tabs")}
          />
          <CopyCommand
            label="Package"
            command={siteConfig.package.installCommand}
          />
        </div>
      </section>

      <section className="docs-section">
        <h2>The components</h2>
        <div className="docs-component-list">
          {components.map((component) => (
            <Link
              key={component.slug}
              href={`/docs/components/${component.slug}`}
            >
              <span>{component.number}</span>
              <strong>{component.name}</strong>
              <p>{component.summary}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="docs-section">
        <h2>The blocks</h2>
        <p>
          Blocks are reusable React components too. They simply cover a larger
          part of a page and compose more behavior. Install them the same way,
          then replace their content through props.
        </p>
        <div className="docs-component-list">
          {blocks.map((block) => (
            <Link key={block.slug} href={`/docs/components/${block.slug}`}>
              <span>{block.number}</span>
              <strong>{block.name}</strong>
              <p>{block.summary}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="docs-section">
        <h2>Compatibility</h2>
        <ul>
          <li>React 18 and 19</li>
          <li>Tailwind CSS 4</li>
          <li>shadcn CLI 4</li>
          <li>
            Next.js, Vite, React Router, and other React projects supported by
            shadcn
          </li>
          <li>Light and dark themes through semantic shadcn tokens</li>
        </ul>
      </section>
    </article>
  )
}
