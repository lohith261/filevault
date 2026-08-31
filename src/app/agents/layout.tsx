import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Agent Storage API — FileVault',
  description: 'One API key. Isolated file storage, semantic search, persistent memory, and cross-agent sharing for AI agents.',
}

export default function AgentsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
