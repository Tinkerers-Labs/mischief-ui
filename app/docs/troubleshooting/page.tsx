import type { Metadata } from "next"

import { DocsPager } from "@/components/docs-pager"
import { ExternalLink } from "@/components/external-link"
import { siteConfig } from "@/site.config"

export const metadata: Metadata = {
  title: `Troubleshooting | ${siteConfig.name}`,
  description:
    "The ways a Mischief UI install actually goes wrong: components arriving unstyled, a scene drawing nothing, an animation that never plays.",
  alternates: { canonical: "/docs/troubleshooting" },
}

export default function TroubleshootingPage() {
  return (
    <article className="docs-article docs-intro">
      <p className="eyebrow">Troubleshooting</p>
      <h1>When it goes wrong.</h1>
      <p className="docs-lead">
        Every one of these has happened, most of them to us. They are listed in
        the order they tend to bite.
      </p>

      <section className="docs-section">
        <h2>The components arrive unstyled</h2>
        <p>
          This is the npm path. Tailwind does not scan <code>node_modules</code>
          , so a package&rsquo;s utility classes are never generated and the
          markup lands without any of them. Point Tailwind at the package in
          your CSS:
        </p>
        <pre>
          <code>{`@import "tailwindcss";\n@source "../node_modules/${siteConfig.package.name}";`}</code>
        </pre>
        <p>
          Installing through the registry copies source into your own project,
          where Tailwind is already looking, so it needs none of this.
        </p>
      </section>

      <section className="docs-section">
        <h2>A scene renders nothing at all</h2>
        <p>
          The scenes draw into a box they do not create. Every one of them is
          positioned <code>relative</code> with no height of its own, so
          dropping one into an absolutely positioned parent collapses it to zero
          and it paints nothing. Give it the box:
        </p>
        <pre>
          <code>{`<div className="relative h-64">\n  <AuroraField className="absolute inset-0" />\n</div>`}</code>
        </pre>
        <p>
          The giveaway is that a grain or gradient layered over it still shows,
          because those position themselves, while the scene underneath does
          not.
        </p>
      </section>

      <section className="docs-section">
        <h2>An animation never plays</h2>
        <p>
          Three components animate a keyframe by name, and the keyframes travel
          with them through the registry rather than living in your stylesheet
          already. Copying the source by hand instead of installing it leaves
          the rule pointing at a keyframe that does not exist: the component
          renders correctly and simply never moves.
        </p>
        <p>
          Install through the CLI and the keyframes are added to your CSS for
          you. If you did copy by hand, the missing rules are in that
          component&rsquo;s entry in the registry, under <code>css</code>.
        </p>
      </section>

      <section className="docs-section">
        <h2>Nothing animates anywhere</h2>
        <p>
          Check whether your system is set to reduce motion. Every component
          here decides what to do when it is, and for most of them the decision
          is to arrive without the movement. That is working as intended, and
          the content is all still there.
        </p>
      </section>

      <section className="docs-section">
        <h2>The CLI cannot find the component</h2>
        <p>
          The short form needs the namespace registered once in your{" "}
          <code>components.json</code>. Without it the CLI has nowhere to
          resolve <code>{siteConfig.registry.namespace}</code> and looks in
          shadcn&rsquo;s own registry instead, where these do not exist.
        </p>
        <pre>
          <code>{`{\n  "registries": {\n    "${siteConfig.registry.namespace}": "${siteConfig.registry.url}"\n  }\n}`}</code>
        </pre>
        <p>
          The long form, which names this repository in full, works without any
          configuration.
        </p>
      </section>

      <section className="docs-section">
        <h2>Still stuck</h2>
        <p>
          Open an issue with the component, the install command you ran, and
          what you expected instead. Everything here is MIT, so a patch is
          welcome too.
        </p>
        <p>
          <ExternalLink
            className="detail-link"
            href={`${siteConfig.repository.url}/issues`}
          >
            Issues on GitHub
          </ExternalLink>
        </p>
      </section>

      <DocsPager href="/docs/troubleshooting" />
    </article>
  )
}
