import type { Metadata } from "next"

import { ComponentCatalog } from "@/components/component-catalog"
import { InstallCommand } from "@/registry/default/install-command/install-command"
import { defaultPackageManager } from "@/lib/package-commands"
import {
  namespaceInstallCommand,
  registryInstallArgs,
  siteConfig,
} from "@/site.config"

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

      <section className="docs-section">
        <h2>Adding several</h2>
        <p>
          The command above names the repository every time, which is fine for
          one component and tiresome for six. Register the namespace once in
          your <code>components.json</code>:
        </p>
        <pre>
          <code>{`{\n  "registries": {\n    "${siteConfig.registry.namespace}": "${siteConfig.registry.url}"\n  }\n}`}</code>
        </pre>
        <p>
          Then every install is the short form, and the CLI resolves it against
          the same files the long form uses:
        </p>
        <pre>
          <code>{namespaceInstallCommand("data-table")}</code>
        </pre>
        <p>
          Both paths fetch identical source. The namespace is an alias, not a
          different distribution, so there is nothing to migrate if you start
          with one and move to the other.
        </p>
      </section>

      <ComponentCatalog />

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
