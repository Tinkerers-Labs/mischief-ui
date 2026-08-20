"use client"

import { DemoVariants } from "@/components/demos/demo-variants"
import {
  SignatureFooter,
  type FooterColumn,
} from "@/registry/default/signature-footer/signature-footer"

const columns: FooterColumn[] = [
  {
    label: "Product",
    links: [
      { label: "Pricing", href: "#" },
      { label: "Changelog", href: "#" },
      { label: "Dashboard", href: "#" },
    ],
  },
  {
    label: "Free tools",
    links: [
      { label: "Link shortener", href: "#" },
      { label: "QR generator", href: "#" },
      { label: "UTM builder", href: "#" },
    ],
  },
  {
    label: "Company",
    links: [
      { label: "Docs", href: "#", external: true },
      { label: "Brand", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
]

const related: FooterColumn = {
  label: "Other products",
  links: [
    { label: "Maillayer", href: "#" },
    { label: "Post Scheduler", href: "#" },
    { label: "Traffic Source", href: "#" },
    { label: "Meta Tags", href: "#" },
    { label: "Blog CMS", href: "#" },
  ],
}

const frame =
  "w-full rounded-[var(--radius)] [&_[data-slot=signature-footer-inner]]:px-6 [&_[data-slot=signature-footer-inner]]:pt-8 [&_[data-slot=signature-footer-wordmark]]:pt-4 [&_[data-slot=signature-footer-wordmark]]:text-[clamp(3rem,9vw,7rem)]"

function Status() {
  return (
    <span className="inline-flex items-center gap-2">
      <span aria-hidden="true" className="bg-accent size-1.5 rounded-full" />
      All systems operational
    </span>
  )
}

export function SignatureFooterDemo() {
  return (
    <DemoVariants
      label="Footer"
      variants={[
        {
          id: "directory",
          label: "Directory",
          render: () => (
            <SignatureFooter
              className={frame}
              heading={<strong className="text-xl">Northstar</strong>}
              description="Short links and file sharing with real-time analytics."
              columns={columns}
              related={related}
              brand={<span>© 2026 Northstar</span>}
              legal={
                <span className="flex gap-5">
                  <a className="no-underline" href="#">
                    Terms
                  </a>
                  <a className="no-underline" href="#">
                    Privacy
                  </a>
                </span>
              }
              status={<Status />}
              wordmark="northstar"
            />
          ),
        },
        {
          id: "light",
          label: "On a light ground",
          render: () => (
            <SignatureFooter
              className={`${frame} bg-card text-card-foreground border-border border`}
              heading={<strong className="text-xl">Northstar</strong>}
              description="Every shade is mixed from the text colour, so nothing has to be restyled."
              columns={columns.slice(0, 2)}
              related={related}
              brand={<span>© 2026 Northstar</span>}
              status={<Status />}
              wordmark="northstar"
            />
          ),
        },
        {
          id: "statement",
          label: "Statement",
          render: () => (
            <SignatureFooter
              className={frame}
              eyebrow="One last useful thought"
              heading="Make the ending memorable."
              description="Keep the links practical. Let the wordmark do the rest."
              brand={<strong>Northstar</strong>}
              meta={<span>Made with care.</span>}
              wordmark="Northstar"
            />
          ),
        },
      ]}
    />
  )
}
