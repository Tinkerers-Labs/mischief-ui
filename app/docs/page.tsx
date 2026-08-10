import Link from "next/link"

import { CopyCommand } from "@/components/copy-command"
import { componentDocs } from "@/lib/component-docs"

export default function DocsPage() {
  return (
    <article className="docs-article">
      <p className="eyebrow">Introduction</p>
      <h1>
        Small collection.
        <br />
        High bar.
      </h1>
      <p className="docs-lead">
        Mischief adds physical feedback and a little personality to familiar
        controls. Every component is open source, theme-aware, and usable with a
        keyboard, touch, pointer, or screen reader where applicable.
      </p>

      <section className="docs-section">
        <h2>Choose how you install</h2>
        <p>
          The shadcn registry copies source into your project. This is the
          recommended path because the component becomes yours. The npm package
          is useful when you want ordinary dependency updates or a quick look at
          the exported API.
        </p>
        <div className="install-options">
          <CopyCommand
            label="Source"
            command="pnpm dlx shadcn@latest add Tinkerers-Labs/mischief-ui/magnetic-tabs"
          />
          <CopyCommand
            label="Package"
            command="pnpm add mischief-ui @base-ui/react motion"
          />
        </div>
      </section>

      <section className="docs-section">
        <h2>The components</h2>
        <div className="docs-component-list">
          {componentDocs.map((component) => (
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
