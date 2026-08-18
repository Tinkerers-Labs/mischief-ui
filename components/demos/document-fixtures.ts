export const samplePages = [1, 2, 3, 4, 5, 6].map((number) => ({ number }))

export const invoiceBoxes = [
  {
    id: "vendor",
    label: "Vendor",
    x: 0.08,
    y: 0.09,
    width: 0.34,
    height: 0.07,
  },
  {
    id: "invoice-no",
    label: "Invoice number",
    x: 0.62,
    y: 0.1,
    width: 0.28,
    height: 0.05,
    tone: "accent" as const,
  },
  {
    id: "total",
    label: "Total due",
    x: 0.58,
    y: 0.74,
    width: 0.32,
    height: 0.08,
    tone: "warning" as const,
  },
]

export const pageImage =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400">
      <rect width="300" height="400" fill="#fbfaf8"/>
      <rect x="24" y="34" width="102" height="28" rx="3" fill="#e6e1da"/>
      <g fill="#ded8d0">
        <rect x="24" y="106" width="252" height="8" rx="3"/>
        <rect x="24" y="126" width="214" height="8" rx="3"/>
        <rect x="24" y="160" width="168" height="8" rx="3"/>
        <rect x="24" y="196" width="126" height="8" rx="3"/>
        <rect x="24" y="230" width="252" height="8" rx="3"/>
        <rect x="24" y="250" width="196" height="8" rx="3"/>
        <rect x="24" y="284" width="232" height="8" rx="3"/>
      </g>
      <rect x="174" y="330" width="96" height="30" rx="3" fill="#e6e1da"/>
    </svg>`
  )
