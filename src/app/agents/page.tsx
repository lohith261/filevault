'use client'

import { useEffect, useState } from 'react'
import { AgentSetup } from '@/components/agents/AgentSetup'
import { AgentDashboard } from '@/components/agents/AgentDashboard'
import { Button } from '@/components/ui/Button'

const STORAGE_KEY = 'fv_agent_key'

const FEATURES = [
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 2.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125m16.5 2.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
      </svg>
    ),
    title: 'Semantic file storage',
    desc: 'Upload any file. Text is extracted, chunked, and embedded automatically — ready to search.',
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
    title: 'Persistent memory',
    desc: 'Store facts, preferences, and context that survive across sessions — with optional TTL.',
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
    ),
    title: 'Natural language search',
    desc: 'Query files and memories in plain English. pgvector HNSW returns results in <50 ms.',
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
      </svg>
    ),
    title: 'Agent-to-agent sharing',
    desc: 'Grant another agent read access to your embeddings — no credential sharing required.',
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
      </svg>
    ),
    title: 'Collections',
    desc: 'Organise files into named groups and scope searches to a project, client, or topic.',
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
      </svg>
    ),
    title: 'Webhooks',
    desc: 'Receive real-time events for file.created, file.indexed, and file.deleted at any URL.',
  },
]

const CODE_SNIPPET = `# 1. Create an agent
curl -X POST https://filevault.host/api/v1/agents \\
  -H "Content-Type: application/json" \\
  -d '{"name": "my-agent"}'
# → {"api_key": "fv_sk_..."}  (shown once — save it)

# 2. Upload & index a file
curl -X POST https://filevault.host/api/v1/files \\
  -H "Authorization: Bearer fv_sk_..." \\
  -F "file=@report.pdf" -F "index=true"

# 3. Search in natural language
curl -X POST https://filevault.host/api/v1/search \\
  -H "Authorization: Bearer fv_sk_..." \\
  -H "Content-Type: application/json" \\
  -d '{"query": "What was the Q3 revenue?"}'`

export default function AgentsPage() {
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const [showSetup, setShowSetup] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    setApiKey(stored)
    setReady(true)
  }, [])

  function handleKeyReady(key: string) {
    localStorage.setItem(STORAGE_KEY, key)
    setApiKey(key)
    setShowSetup(false)
  }

  function handleForget() {
    localStorage.removeItem(STORAGE_KEY)
    setApiKey(null)
  }

  if (!ready) return null

  // Already have a key — go straight to dashboard
  if (apiKey) {
    return <AgentDashboard apiKey={apiKey} onForget={handleForget} />
  }

  // Setup modal overlay
  if (showSetup) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <div className="w-full max-w-lg">
          <AgentSetup onKeyReady={handleKeyReady} />
          <button
            onClick={() => setShowSetup(false)}
            className="mt-4 w-full text-center text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            ← Back
          </button>
        </div>
      </div>
    )
  }

  // Marketing landing
  return (
    <div className="mx-auto max-w-5xl px-6 pt-28 pb-24">
      {/* Hero */}
      <div className="text-center mb-16">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--primary)] mb-4">
          Agent Storage API
        </p>
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-[1.05] text-[var(--foreground)]">
          Storage built for<br />
          <span className="text-[var(--primary)]">AI agents.</span>
        </h1>
        <p className="mt-5 text-lg text-[var(--muted-foreground)] max-w-xl mx-auto">
          One API key. Files, semantic search, persistent memory, and cross-agent sharing — no stitching required.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
          <Button onClick={() => setShowSetup(true)} className="px-6 py-2.5 text-sm">
            Get an API key →
          </Button>
          <a
            href="/help"
            className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-5 py-2.5 text-sm font-medium text-[var(--muted-foreground)] transition-colors hover:border-[var(--primary)] hover:text-[var(--foreground)]"
          >
            Read the docs
          </a>
        </div>
        <p className="mt-4 text-xs text-[var(--muted-foreground)]">
          No account needed · API key shown once
        </p>
      </div>

      {/* Code snippet */}
      <div className="mb-16 rounded-xl border border-[var(--border)] bg-[var(--foreground)] overflow-hidden">
        <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/10">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
          <span className="ml-2 text-xs text-white/40 font-mono">bash</span>
        </div>
        <pre className="px-5 py-4 text-xs font-mono text-white/80 overflow-x-auto leading-relaxed whitespace-pre">{CODE_SNIPPET}</pre>
      </div>

      {/* Feature grid */}
      <div className="mb-16">
        <h2 className="text-center text-xl font-semibold text-[var(--foreground)] mb-8">Everything your agent needs</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 hover:border-[var(--primary)]/40 hover:shadow-md hover:shadow-black/[0.06] transition-all"
            >
              <div className="mb-3 text-[var(--primary)]">{f.icon}</div>
              <p className="text-sm font-semibold text-[var(--foreground)] mb-1">{f.title}</p>
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-2xl border border-[var(--primary)]/20 bg-[var(--primary)]/5 p-10 text-center">
        <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">Ready to build?</h2>
        <p className="text-sm text-[var(--muted-foreground)] mb-6 max-w-md mx-auto">
          Create an agent, get your API key, and make your first upload in under 2 minutes.
          Already have a key? Enter it to access your dashboard.
        </p>
        <Button onClick={() => setShowSetup(true)} className="px-8 py-2.5">
          Get started →
        </Button>
      </div>
    </div>
  )
}
