import type { Metadata } from "next"

import { DocsPager } from "@/components/docs-pager"
import { defaultPackageManager } from "@/lib/package-commands"
import { InstallCommand } from "@/registry/default/install-command/install-command"
import {
  namespaceInstallCommand,
  registryInstallArgs,
  siteConfig,
} from "@/site.config"

export const metadata: Metadata = {
  title: `Installation | ${siteConfig.name}`,
  description:
    "Install Mischief UI components through the shadcn registry or npm, and register the namespace so every install is the short form.",
  alternates: { canonical: "/docs/installation" },
}

export default function InstallationPage() {
  return (
    <article className="docs-article docs-intro">
      <p className="eyebrow">Installation</p>
      <h1>Two ways in.</h1>
      <p className="docs-lead">
        The shadcn registry copies source into your project, which is the
        recommended path. The npm package is useful when you want ordinary
        dependency updates or a quick look at the exported API.
      </p>

      <section className="docs-section">
        <h2>Choose how you install</h2>
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

      <DocsPager href="/docs/installation" />
    </article>
  )
}
