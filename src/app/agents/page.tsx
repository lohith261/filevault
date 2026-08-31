'use client'

import { useAuth, SignInButton } from '@clerk/nextjs'
import { AgentDashboard } from '@/components/agents/AgentDashboard'
import { Button } from '@/components/ui/Button'

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

const BASE_DOMAIN = process.env.NEXT_PUBLIC_BASE_DOMAIN ?? 'filevault.host'
const DASHBOARD_ORIGIN = `https://dashboard.${BASE_DOMAIN}`

export default function AgentsPage() {
  const { isSignedIn, userId } = useAuth()

  // Dashboard only renders when accessed via dashboard.filevault.host
  const onDashboardSubdomain =
    typeof window !== 'undefined' &&
    window.location.hostname === `dashboard.${BASE_DOMAIN}`

  if (onDashboardSubdomain) {
    if (isSignedIn && userId) return <AgentDashboard userId={userId} />
    // Signed-out on dashboard subdomain — prompt sign-in
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">Sign in to access your dashboard</h1>
        <p className="text-sm text-[var(--muted-foreground)] mb-6 max-w-sm">
          Your agents, files, and memories are waiting. Sign in to continue.
        </p>
        <SignInButton mode="modal">
          <Button className="px-6 py-2.5">Sign in →</Button>
        </SignInButton>
      </div>
    )
  }

  // filevault.host/agents — always shows the marketing landing.
  // Signed-in users see "Open dashboard →" instead of "Get started".
  const heroCTA = isSignedIn ? (
    <a
      href={DASHBOARD_ORIGIN}
      className="inline-flex items-center rounded-lg bg-[var(--brand)] px-6 py-2.5 text-sm font-semibold text-[var(--brand-foreground)] hover:bg-[var(--brand-hover)] transition-colors"
    >
      Open dashboard →
    </a>
  ) : (
    <SignInButton mode="modal">
      <Button className="px-6 py-2.5 text-sm">Get started →</Button>
    </SignInButton>
  )

  const bottomCTA = isSignedIn ? (
    <a
      href={DASHBOARD_ORIGIN}
      className="inline-flex items-center rounded-lg bg-[var(--brand)] px-8 py-2.5 text-sm font-semibold text-[var(--brand-foreground)] hover:bg-[var(--brand-hover)] transition-colors"
    >
      Open dashboard →
    </a>
  ) : (
    <SignInButton mode="modal">
      <Button className="px-8 py-2.5">Sign in to get started →</Button>
    </SignInButton>
  )

  return (
    <div className="mx-auto max-w-5xl px-6 pt-28 pb-24">
      {/* Hero */}
      <div className="text-center mb-16">
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-[1.05] text-[var(--foreground)]">
          Storage built for<br />
          <span className="text-[var(--brand)]">AI agents.</span>
        </h1>
        <p className="mt-5 text-lg text-[var(--muted-foreground)] max-w-xl mx-auto">
          One API key. Files, semantic search, persistent memory, and cross-agent sharing — no stitching required.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
          {heroCTA}
          <a
            href="/help"
            className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-5 py-2.5 text-sm font-medium text-[var(--muted-foreground)] transition-colors hover:border-[var(--brand)] hover:text-[var(--foreground)]"
          >
            Read the docs
          </a>
        </div>
        {!isSignedIn && (
          <p className="mt-4 text-xs text-[var(--muted-foreground)]">
            Free to start · No credit card required
          </p>
        )}
      </div>

      {/* Code snippet */}
      <div className="mb-16 rounded-xl border border-[var(--border)] bg-[#0d0d12] overflow-hidden shadow-xl shadow-black/30">
        <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          <span className="ml-2 text-xs text-[#4b5563] font-mono">bash</span>
        </div>
        <pre className="px-5 py-4 text-[12.5px] font-mono text-[#a1a1aa] overflow-x-auto leading-relaxed whitespace-pre">{CODE_SNIPPET}</pre>
      </div>

      {/* Feature grid */}
      <div className="mb-16">
        <h2 className="text-center text-xl font-semibold text-[var(--foreground)] mb-8">Everything your agent needs</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 hover:border-[var(--brand)]/40 hover:shadow-md hover:shadow-black/[0.06] transition-all"
            >
              <div className="mb-3 text-[var(--brand)]">{f.icon}</div>
              <p className="text-sm font-semibold text-[var(--foreground)] mb-1">{f.title}</p>
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-2xl border border-[var(--brand)]/20 bg-[var(--brand)]/5 p-10 text-center">
        <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">Ready to build?</h2>
        <p className="text-sm text-[var(--muted-foreground)] mb-6 max-w-md mx-auto">
          {isSignedIn
            ? 'Your dashboard is ready. Manage agents, upload files, and search in natural language.'
            : 'Sign in to create an agent, upload files, and start searching in under 2 minutes.'}
        </p>
        {bottomCTA}
      </div>
    </div>
  )
}
