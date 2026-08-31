import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Documentation — FileVault',
  description: 'Complete reference for the FileVault Agent API — authentication, files, indexing, search, memory, collections, webhooks, and the MCP server.',
}

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
