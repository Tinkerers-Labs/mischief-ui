import { DocsShell } from "@/components/docs-shell"

export default function ChangelogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DocsShell>{children}</DocsShell>
}
