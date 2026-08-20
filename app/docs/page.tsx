import type { Metadata } from "next"
import Link from "next/link"

import { InstallCommand } from "@/registry/default/install-command/install-command"
import { componentFamilies } from "@/lib/component-docs"
import { defaultPackageManager } from "@/lib/package-commands"
import { registryInstallArgs, siteConfig } from "@/site.config"

export const metadata: Metadata = {
  title: `Documentation | ${siteConfig.name}`,
  description:
    "Install Mischief UI components through the shadcn registry or npm, then adapt the source for your React project.",
  alternates: { canonical: "/docs" },
}

export default function DocsPage() {
  return (
    <article className="docs-article docs-intro">
      <p className="eyebrow">Introduction</p>
      <h1>
        Growing collection.
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
        <InstallCommand
          add={siteConfig.package.installArgs}
          defaultManager={defaultPackageManager}
          run={registryInstallArgs("magnetic-tabs")}
        />
        <p>
          Installing from npm needs one more line. Tailwind does not scan{" "}
          <code>node_modules</code>, so a package&rsquo;s utility classes are
          never generated and components arrive unstyled. Point it at this one
          in your CSS:
        </p>
        <pre>
          <code>{`@import "tailwindcss";\n@source "../node_modules/mischief-ui";`}</code>
        </pre>
        <p>
          The registry path copies source into your project, where it is scanned
          already, so it needs nothing.
        </p>
      </section>

      {componentFamilies.map((family) => (
        <section className="docs-section" key={family.name}>
          <h2>
            {family.name}
            <span className="docs-family-count">
              {family.components.length}
            </span>
          </h2>
          <p>{family.description}</p>
          <div className="docs-component-list">
            {family.components.map((component) => (
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
      ))}

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
