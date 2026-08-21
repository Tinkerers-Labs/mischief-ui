"use client"

import { DemoVariants } from "@/components/demos/demo-variants"
import {
  FooterColumns,
  type FooterColumn,
} from "@/registry/default/footer-columns/footer-columns"

const groups: FooterColumn[] = [
  {
    label: "Product",
    links: [
      { label: "Pricing", href: "#" },
      { label: "Changelog", href: "#" },
    ],
  },
  {
    label: "Tools",
    links: [
      { label: "QR codes", href: "#" },
      { label: "UTM builder", href: "#" },
    ],
  },
  {
    label: "Company",
    links: [
      { label: "Brand", href: "#" },
      { label: "Docs", href: "#", external: true },
    ],
  },
  {
    label: "Legal",
    links: [
      { label: "Terms", href: "#" },
      { label: "Privacy", href: "#" },
    ],
  },
]

export function FooterColumnsDemo() {
  return (
    <DemoVariants
      label="Columns"
      variants={[
        {
          id: "three",
          label: "Three",
          render: () => (
            <div className="w-full max-w-2xl">
              <FooterColumns columns={groups.slice(0, 3)} />
            </div>
          ),
        },
        {
          id: "four",
          label: "Four",
          render: () => (
            <div className="w-full max-w-2xl">
              <FooterColumns columnCount={4} columns={groups} />
            </div>
          ),
        },
      ]}
    />
  )
}
