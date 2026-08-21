import { render, screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import {
  SignatureFooter,
  type FooterColumn,
} from "../registry/default/signature-footer/signature-footer"

const columns: FooterColumn[] = [
  {
    label: "Product",
    links: [
      { label: "Pricing", href: "/pricing" },
      { label: "Docs", href: "https://docs.example.com", external: true },
    ],
  },
  { label: "Company", links: [{ label: "Brand", href: "/brand" }] },
]

describe("SignatureFooter", () => {
  it("needs nothing but a wordmark", () => {
    const { container } = render(<SignatureFooter wordmark="northstar" />)

    expect(container.querySelector("h2")).toBeNull()
    expect(
      container.querySelector('[data-slot="signature-footer-wordmark"]')
    ).toHaveTextContent("northstar")
  })

  it("keeps the wordmark out of the accessibility tree", () => {
    const { container } = render(<SignatureFooter wordmark="northstar" />)

    expect(
      container.querySelector('[data-slot="signature-footer-wordmark"]')
    ).toHaveAttribute("aria-hidden", "true")
  })

  it("lays out labelled columns", () => {
    render(<SignatureFooter columns={columns} wordmark="n" />)

    expect(screen.getByText("Product")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /Pricing/ })).toHaveAttribute(
      "href",
      "/pricing"
    )
  })

  it("says when a link leaves the site", () => {
    render(<SignatureFooter columns={columns} wordmark="n" />)

    const docs = screen.getByRole("link", { name: /Docs/ })

    expect(docs).toHaveAttribute("target", "_blank")
    expect(docs).toHaveAttribute("rel", "noreferrer noopener")
    expect(docs).toHaveAccessibleName("Docs, opens in a new tab")
  })

  it("hands every link back when asked", () => {
    render(
      <SignatureFooter
        columns={columns}
        renderLink={({ href, label }) => (
          <a data-mine="true" href={href}>
            {label}
          </a>
        )}
        wordmark="n"
      />
    )

    expect(screen.getByRole("link", { name: "Pricing" })).toHaveAttribute(
      "data-mine",
      "true"
    )
  })

  it("sets the related row apart, under its own label", () => {
    const { container } = render(
      <SignatureFooter
        columns={columns}
        related={{
          label: "Other products",
          links: [{ label: "Kagaz", href: "/k" }],
        }}
        wordmark="n"
      />
    )

    const row = container.querySelector(
      '[data-slot="signature-footer-related"]'
    ) as HTMLElement

    expect(within(row).getByText("Other products")).toBeInTheDocument()
    expect(within(row).getByRole("link", { name: "Kagaz" })).toBeInTheDocument()
    expect(row.className).toContain("border-dashed")
  })

  it("leaves the related row out when it has no links", () => {
    const { container } = render(
      <SignatureFooter related={{ label: "Other", links: [] }} wordmark="n" />
    )

    expect(
      container.querySelector('[data-slot="signature-footer-related"]')
    ).toBeNull()
  })

  it("prefers columns over hand-built navigation", () => {
    const { container } = render(
      <SignatureFooter
        columns={columns}
        navigation={<nav>mine</nav>}
        wordmark="n"
      />
    )

    expect(
      container.querySelector('[data-slot="signature-footer-navigation"]')
    ).toBeNull()
    expect(screen.queryByText("mine")).toBeNull()
  })

  it("still takes hand-built navigation on its own", () => {
    const { container } = render(
      <SignatureFooter navigation={<nav>mine</nav>} wordmark="n" />
    )

    expect(
      container.querySelector('[data-slot="signature-footer-navigation"]')
    ).toBeInTheDocument()
  })

  it("opens the closing row only when something fills it", () => {
    const { container, rerender } = render(<SignatureFooter wordmark="n" />)

    expect(
      container.querySelector('[data-slot="signature-footer-meta"]')
    ).toBeNull()

    rerender(<SignatureFooter status={<span>All good</span>} wordmark="n" />)
    expect(
      container.querySelector('[data-slot="signature-footer-meta"]')
    ).toHaveTextContent("All good")
  })

  it("mixes its shades from the text colour, not a theme token", () => {
    const { container } = render(
      <SignatureFooter description="hello" wordmark="n" />
    )

    const description = container.querySelector(
      '[data-slot="signature-footer-description"]'
    )

    expect(description?.className).toContain("currentColor")
  })
})

describe("the block and its parts", () => {
  it("keeps its own slot names, so styling that targets them still matches", () => {
    const { container } = render(
      <SignatureFooter
        related={{ label: "Also", links: [{ label: "Kagaz", href: "/k" }] }}
        wordmark="northstar"
      />
    )

    expect(
      container.querySelector('[data-slot="signature-footer-wordmark"]')
    ).toBeInTheDocument()
    expect(
      container.querySelector('[data-slot="signature-footer-related"]')
    ).toBeInTheDocument()
  })

  it("passes the column count through to the columns", () => {
    const { container } = render(
      <SignatureFooter columns={columns} columnCount={6} wordmark="n" />
    )

    const grid = container.querySelector(
      '[data-slot="footer-columns"]'
    ) as HTMLElement

    expect(grid.style.getPropertyValue("--footer-columns")).toBe("6")
  })
})
