import type { Metadata } from "next"

import { releases } from "@/lib/changelog"
import { siteConfig } from "@/site.config"

export const metadata: Metadata = {
  title: `Changelog | ${siteConfig.name}`,
  description: `What changed in ${siteConfig.name}, release by release.`,
  alternates: { canonical: "/changelog" },
}

const when = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
})

export default function ChangelogPage() {
  return (
    <article className="docs-article docs-intro">
      <p className="eyebrow">Changelog</p>
      <h1>What changed.</h1>
      <p className="docs-lead">
        Every release, newest first. Versions are published to npm as{" "}
        <code>{siteConfig.package.name}</code> and tagged in the repository.
      </p>

      {releases.map((release) => (
        <section className="docs-section" key={release.version}>
          <h2>
            {release.title}
            <span className="docs-family-count">{release.version}</span>
          </h2>
          <p className="text-muted-foreground text-sm">
            <time dateTime={release.date}>
              {when.format(new Date(release.date))}
            </time>
          </p>
          <p>{release.summary}</p>
          <ul>
            {release.changes.map((change) => (
              <li key={change}>{change}</li>
            ))}
          </ul>
        </section>
      ))}
    </article>
  )
}
