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
