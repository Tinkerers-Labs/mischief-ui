import type { Metadata } from "next"
import {
  Bricolage_Grotesque,
  Geist_Mono,
  Schibsted_Grotesk,
} from "next/font/google"

import "./globals.css"

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
})

const body = Schibsted_Grotesk({
  subsets: ["latin"],
  variable: "--font-schibsted",
})

const mono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

export const metadata: Metadata = {
  title: "Mischief | UI with personality",
  description:
    "Playful, production-ready React components that work with shadcn.",
  metadataBase: new URL("https://tinkerers-labs.github.io/mischief-ui/"),
  openGraph: {
    title: "Mischief",
    description: "Good interfaces deserve a little mischief.",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable}`}
    >
      <body className="pt-18 font-sans">{children}</body>
    </html>
  )
}
