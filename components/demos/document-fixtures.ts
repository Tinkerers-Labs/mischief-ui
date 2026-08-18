/** Generated from public/demo/documents/master-services-agreement.pdf. */
export const SAMPLE_PDF = "/demo/documents/master-services-agreement.pdf"
export const SAMPLE_DOCX = "/demo/documents/master-services-agreement.docx"
export const SAMPLE_CSV = "/demo/documents/invoices.csv"
export const PDF_WORKER = "/demo/pdf.worker.min.mjs"

export const PAGE_COUNT = 3

export const samplePages = Array.from({ length: PAGE_COUNT }, (_, index) => ({
  number: index + 1,
  src: `/demo/documents/page-${index + 1}.png`,
}))

export const pageImage = samplePages[0]!.src

/**
 * Read out of the PDF text layer and checked by drawing them back onto the
 * exported page, so every region sits on the value it names.
 */
export const invoiceBoxes = [
  {
    id: "customer",
    label: "Customer",
    x: 0.2979,
    y: 0.1893,
    width: 0.1397,
    height: 0.022,
  },
  {
    id: "agreement-no",
    label: "Agreement number",
    x: 0.2979,
    y: 0.2484,
    width: 0.125,
    height: 0.022,
    tone: "accent" as const,
  },
  {
    id: "net30",
    label: "Payment window",
    x: 0.3247,
    y: 0.6301,
    width: 0.0553,
    height: 0.0214,
  },
  {
    id: "late-fee",
    label: "Late payment",
    x: 0.3247,
    y: 0.6876,
    width: 0.1011,
    height: 0.0214,
    tone: "warning" as const,
  },
]

export const customerRegion = {
  x: 0.2979,
  y: 0.1893,
  width: 0.1397,
  height: 0.022,
}
export const agreementRegion = {
  x: 0.2979,
  y: 0.2484,
  width: 0.125,
  height: 0.022,
}
export const paymentRegion = {
  x: 0.3247,
  y: 0.6301,
  width: 0.0553,
  height: 0.0214,
}
