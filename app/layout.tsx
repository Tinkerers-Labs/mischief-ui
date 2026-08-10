import type { Metadata, Viewport } from "next"
import {
  Bricolage_Grotesque,
  Geist_Mono,
  Schibsted_Grotesk,
} from "next/font/google"

import { siteConfig } from "@/site.config"

import "./globals.css"

const themeScript = `(() => {
  try {
    const saved = localStorage.getItem("mischief-theme");
    const theme = saved === "light" || saved === "dark"
      ? saved
      : matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
  } catch (_) {}
})();`

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
  title: siteConfig.title,
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.tagline,
    type: "website",
    images: [
      {
        url: siteConfig.assets.socialPreview,
        width: 1280,
        height: 640,
        alt: `${siteConfig.name}. ${siteConfig.tagline}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.tagline,
    images: [siteConfig.assets.socialPreview],
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1d1a18" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="pt-16 font-sans">{children}</body>
    </html>
  )
}
