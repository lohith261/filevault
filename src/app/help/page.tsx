'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

/* ─── Content ──────────────────────────────────────────────────────────────── */

const NAV = [
  { id: 'overview', label: 'Overview' },
  { id: 'quickstart', label: 'Quick start' },
  { id: 'authentication', label: 'Authentication' },
  { id: 'files', label: 'Files & storage' },
  { id: 'indexing', label: 'Indexing & search' },
  { id: 'memory', label: 'Memory' },
  { id: 'collections', label: 'Collections' },
  { id: 'sharing', label: 'Sharing' },
  { id: 'webhooks', label: 'Webhooks' },
  { id: 'mcp', label: 'MCP server' },
  { id: 'human-hosting', label: 'Human hosting' },
  { id: 'troubleshooting', label: 'Troubleshooting' },
]

/* ─── Helpers ──────────────────────────────────────────────────────────────── */

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="scroll-mt-24 text-2xl font-bold text-[var(--foreground)] mb-4 mt-0 pb-3 border-b border-[var(--border)]">
      {children}
    </h2>
  )
}

function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-base font-semibold text-[var(--foreground)] mb-2 mt-6">{children}</h3>
  )
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-[var(--muted-foreground)] leading-relaxed mb-4">{children}</p>
}

function Code({ children }: { children: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(children)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }
  return (
    <div className="relative group rounded-xl border border-[var(--border)] bg-[var(--foreground)] overflow-hidden mb-5">
      <button
        onClick={copy}
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity rounded-md bg-white/10 px-2 py-1 text-[10px] font-mono text-white/60 hover:text-white hover:bg-white/20"
      >
        {copied ? 'copied!' : 'copy'}
      </button>
      <pre className="px-5 py-4 text-xs font-mono text-white/80 overflow-x-auto leading-relaxed whitespace-pre">{children}</pre>
    </div>
  )
}

function Inline({ children }: { children: string }) {
  return <code className="rounded bg-[var(--muted)] border border-[var(--border)] px-1.5 py-0.5 text-[11px] font-mono text-[var(--foreground)]">{children}</code>
}

function Table({ rows }: { rows: [string, string, string][] }) {
  return (
    <div className="overflow-x-auto mb-5">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="border-b border-[var(--border)]">
            {['Method', 'Path', 'Description'].map(h => (
              <th key={h} className="text-left py-2 pr-4 font-semibold text-[var(--foreground)] whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(([method, path, desc]) => (
            <tr key={path} className="border-b border-[var(--border)]/50">
              <td className="py-2 pr-4 font-mono text-[var(--primary)] whitespace-nowrap">{method}</td>
              <td className="py-2 pr-4 font-mono text-[var(--foreground)] whitespace-nowrap">{path}</td>
              <td className="py-2 text-[var(--muted-foreground)]">{desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Callout({ kind, children }: { kind: 'info' | 'warning' | 'tip'; children: React.ReactNode }) {
  const styles = {
    info:    'border-[var(--primary)]/30 bg-[var(--primary)]/5 text-[var(--primary)]',
    warning: 'border-yellow-400/40 bg-yellow-50/60 text-yellow-800 dark:bg-yellow-400/10 dark:text-yellow-300',
    tip:     'border-green-500/30 bg-green-50/60 text-green-800 dark:bg-green-500/10 dark:text-green-300',
  }
  const icons = { info: 'ℹ', warning: '⚠', tip: '✦' }
  return (
    <div className={`flex gap-3 rounded-lg border px-4 py-3 mb-4 text-xs leading-relaxed ${styles[kind]}`}>
      <span className="shrink-0 font-bold">{icons[kind]}</span>
      <span>{children}</span>
    </div>
  )
}

/* ─── Page ─────────────────────────────────────────────────────────────────── */

export default function HelpPage() {
  const [active, setActive] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const observer = useRef<IntersectionObserver | null>(null)

  // Highlight sidebar nav item as sections scroll into view
  useEffect(() => {
    observer.current = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(e.target.id)
        }
      },
      { rootMargin: '-30% 0px -65% 0px' }
    )
    NAV.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.current?.observe(el)
    })
    return () => observer.current?.disconnect()
  }, [])

  return (
    <div className="min-h-screen pt-16">
      {/* Top bar */}
      <div className="border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur-sm sticky top-16 z-30">
        <div className="mx-auto max-w-6xl px-6 flex items-center justify-between h-11 gap-4">
          <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
            <Link href="/" className="hover:text-[var(--foreground)] transition-colors">FileVault</Link>
            <span>/</span>
            <span className="text-[var(--foreground)] font-medium">Documentation</span>
          </div>
          <a
            href="https://github.com/lohith261/filevault"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" /></svg>
            GitHub
          </a>
          {/* Mobile sidebar toggle */}
          <button
            className="sm:hidden text-xs text-[var(--muted-foreground)] border border-[var(--border)] rounded px-2.5 py-1"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? 'Close' : 'Menu'}
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 flex gap-10 py-8">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'block' : 'hidden'} sm:block w-52 shrink-0`}>
          <nav className="sticky top-28 space-y-0.5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--muted-foreground)] px-3 py-2">
              Contents
            </p>
            {NAV.map(({ id, label }) => (
              <a
                key={id}
                href={`#${id}`}
                onClick={() => setSidebarOpen(false)}
                className={`block rounded-md px-3 py-1.5 text-sm transition-colors ${
                  active === id
                    ? 'bg-[var(--primary)]/10 text-[var(--primary)] font-medium'
                    : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]'
                }`}
              >
                {label}
              </a>
            ))}
            <div className="pt-4 px-3">
              <a
                href="mailto:support@filevault.host"
                className="block text-xs text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors"
              >
                ✉ support@filevault.host
              </a>
            </div>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 space-y-14">

          {/* Overview */}
          <section id="overview" className="scroll-mt-24">
            <H2 id="overview">Overview</H2>
            <P>FileVault is two products in one codebase:</P>
            <div className="grid sm:grid-cols-2 gap-4 mb-5">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
                <p className="text-sm font-semibold text-[var(--foreground)] mb-1">Agent Storage API</p>
                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                  A REST API for AI agents — isolated file storage, semantic search with pgvector, persistent memory, collections, cross-agent sharing, and webhooks. One API key, no S3 glue required.
                </p>
              </div>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
                <p className="text-sm font-semibold text-[var(--foreground)] mb-1">Human hosting</p>
                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                  Drop a ZIP or HTML file on the homepage, get a shareable URL in seconds. Supports password protection, custom domains, expiry, and view analytics.
                </p>
              </div>
            </div>
            <Callout kind="info">
              The Agent API and the human hosting product share infrastructure but are completely independent. You don&apos;t need a Clerk account to use the Agent API.
            </Callout>
          </section>

          {/* Quick start */}
          <section id="quickstart" className="scroll-mt-24">
            <H2 id="quickstart">Quick start</H2>
            <P>Three curl commands to go from zero to semantic search:</P>
            <Code>{`# 1. Create an agent — returns your API key (shown once)
curl -X POST https://filevault.host/api/v1/agents \\
  -H "Content-Type: application/json" \\
  -d '{"name": "my-agent"}'

# 2. Upload a file and index it for search
curl -X POST https://filevault.host/api/v1/files \\
  -H "Authorization: Bearer fv_sk_..." \\
  -F "file=@report.pdf" \\
  -F "index=true"

# 3. Search in natural language
curl -X POST https://filevault.host/api/v1/search \\
  -H "Authorization: Bearer fv_sk_..." \\
  -H "Content-Type: application/json" \\
  -d '{"query": "What was the Q3 revenue?", "limit": 5}'`}</Code>
            <Callout kind="warning">
              Your API key is shown <strong>exactly once</strong> at agent creation. Copy it immediately — it cannot be retrieved. If you lose it, create a new agent.
            </Callout>
            <H3>TypeScript SDK</H3>
            <P>The SDK wraps every endpoint with full TypeScript types. Import it from <Inline>src/sdk/index.ts</Inline> in the repo or copy the class into your project.</P>
            <Code>{`import { FileVault } from '@/sdk'

const fv = new FileVault('fv_sk_...')

const file = await fv.files.upload(blob, { index: true, metadata: { project: 'q3' } })
const results = await fv.search('What is the refund policy?')
await fv.memory.add('User prefers bullet points.', { ttl_seconds: 86400 })`}</Code>
          </section>

          {/* Authentication */}
          <section id="authentication" className="scroll-mt-24">
            <H2 id="authentication">Authentication</H2>
            <P>Every Agent API request requires a Bearer token in the <Inline>Authorization</Inline> header:</P>
            <Code>{`Authorization: Bearer fv_sk_<64 hex characters>`}</Code>
            <P>Keys are created via <Inline>POST /api/v1/agents</Inline> and stored as SHA-256 hashes — FileVault cannot recover a lost key. Missing or invalid keys return <Inline>401 Unauthorized</Inline>.</P>
            <P>The human dashboard (<Inline>/dashboard</Inline>) uses Clerk session auth — completely separate from the agent key system.</P>
          </section>

          {/* Files */}
          <section id="files" className="scroll-mt-24">
            <H2 id="files">Files &amp; storage</H2>
            <Table rows={[
              ['GET',    '/api/v1/files',              'List files (paginated, indexed= filter)'],
              ['POST',   '/api/v1/files',              'Upload a file (multipart)'],
              ['POST',   '/api/v1/files/batch',        'Batch upload up to 10 files'],
              ['GET',    '/api/v1/files/:id',          'File metadata + index_status'],
              ['DELETE', '/api/v1/files/:id',          'Delete file + all embeddings'],
              ['POST',   '/api/v1/files/:id/index',    'Trigger indexing on demand'],
            ]} />
            <H3>Uploading</H3>
            <P>Send a <Inline>multipart/form-data</Inline> request with a <Inline>file</Inline> field. Add <Inline>index=true</Inline> to auto-index on upload. Optional <Inline>metadata</Inline> field accepts a JSON string of key/value pairs.</P>
            <Code>{`curl -X POST https://filevault.host/api/v1/files \\
  -H "Authorization: Bearer fv_sk_..." \\
  -F "file=@report.pdf" \\
  -F "index=true" \\
  -F 'metadata={"project":"q3","author":"alice"}'`}</Code>
            <H3>Supported types for indexing</H3>
            <P>All file types are stored. Text extraction for semantic search works on: <Inline>text/html</Inline>, <Inline>text/plain</Inline>, <Inline>application/pdf</Inline>, and <Inline>application/json</Inline>. Other file types are stored and downloadable but won&apos;t produce search results.</P>
            <Callout kind="info">
              There is no enforced per-agent storage quota at this time. The upload rate limit is 20 files per minute.
            </Callout>
          </section>

          {/* Indexing & search */}
          <section id="indexing" className="scroll-mt-24">
            <H2 id="indexing">Indexing &amp; search</H2>
            <H3>How indexing works</H3>
            <P>When a file is indexed, FileVault: (1) extracts text from the file, (2) splits it into overlapping chunks (~500 tokens, 100-token overlap), (3) generates an embedding for each chunk via OpenRouter (<Inline>openai/text-embedding-3-small</Inline>), and (4) stores the vectors in a pgvector index on Supabase.</P>
            <H3>index_status lifecycle</H3>
            <Code>{`not_indexed  →  pending  →  indexed`}</Code>
            <P>Poll <Inline>GET /api/v1/files/:id</Inline> and check the <Inline>index_status</Inline> field. Once <Inline>indexed</Inline>, the file is searchable.</P>
            <H3>Searching</H3>
            <Table rows={[
              ['POST', '/api/v1/search', 'Semantic search across files and memory'],
            ]} />
            <Code>{`POST /api/v1/search
{
  "query": "quarterly revenue breakdown",
  "limit": 5,
  "filter": {
    "type": "all",           // "all" | "files" | "memory"
    "file_id": "clx...",     // scope to one file
    "collection_id": "clx...",
    "include_shared": true,  // include shared agent content
    "metadata": { "project": "q3" }
  }
}`}</Code>
            <P>Results are ranked by cosine similarity. Each result includes a <Inline>score</Inline> (0–1), the matching <Inline>content</Inline> chunk, and the source <Inline>file_id</Inline>.</P>
          </section>

          {/* Memory */}
          <section id="memory" className="scroll-mt-24">
            <H2 id="memory">Memory</H2>
            <P>Memory lets your agent store arbitrary text snippets — conversation turns, extracted facts, decisions, or anything it wants to recall later. Each memory gets an embedding and is searchable alongside files.</P>
            <Table rows={[
              ['POST',   '/api/v1/memory',     'Store a memory { content, ttl? }'],
              ['GET',    '/api/v1/memory',      'List memories (paginated)'],
              ['DELETE', '/api/v1/memory/:id',  'Delete a single memory'],
            ]} />
            <Code>{`# Store with a 24-hour TTL
curl -X POST https://filevault.host/api/v1/memory \\
  -H "Authorization: Bearer fv_sk_..." \\
  -H "Content-Type: application/json" \\
  -d '{"content": "User prefers metric units.", "ttl": 86400}'`}</Code>
            <P>Pass <Inline>type=memory</Inline> in a search request to search only memories. Omit it (or use <Inline>type=all</Inline>) to search both files and memories together.</P>
          </section>

          {/* Collections */}
          <section id="collections" className="scroll-mt-24">
            <H2 id="collections">Collections</H2>
            <P>Collections are named groups of files within your agent&apos;s namespace. Use them to organise by project, client, or topic — and to scope searches to a subset of your storage.</P>
            <Table rows={[
              ['GET',    '/api/v1/collections',              'List collections with file counts'],
              ['POST',   '/api/v1/collections',              'Create { name }'],
              ['GET',    '/api/v1/collections/:id',          'Get collection + files'],
              ['DELETE', '/api/v1/collections/:id',          'Delete collection (files unaffected)'],
              ['POST',   '/api/v1/collections/:id/files',    'Add file { file_id }'],
              ['DELETE', '/api/v1/collections/:id/files/:fileId', 'Remove file from collection'],
            ]} />
          </section>

          {/* Sharing */}
          <section id="sharing" className="scroll-mt-24">
            <H2 id="sharing">Agent-to-agent sharing</H2>
            <P>Grant another agent read access to your files and embeddings without sharing credentials. The grantee can include your content in searches via <Inline>include_shared=true</Inline>.</P>
            <Table rows={[
              ['GET',    '/api/v1/shares',             'List shares given and received'],
              ['POST',   '/api/v1/shares',             'Grant access { agent_id }'],
              ['DELETE', '/api/v1/shares/:granteeId',  'Revoke access'],
            ]} />
            <Code>{`# Grant access
curl -X POST https://filevault.host/api/v1/shares \\
  -H "Authorization: Bearer fv_sk_..." \\
  -H "Content-Type: application/json" \\
  -d '{"agent_id": "clx..."}'

# Search including shared content
curl -X POST https://filevault.host/api/v1/search \\
  -H "Authorization: Bearer fv_sk_..." \\
  -H "Content-Type: application/json" \\
  -d '{"query": "project brief", "filter": {"include_shared": true}}'`}</Code>
          </section>

          {/* Webhooks */}
          <section id="webhooks" className="scroll-mt-24">
            <H2 id="webhooks">Webhooks</H2>
            <P>FileVault fires a POST to your registered URL on three events:</P>
            <div className="mb-4 overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="text-left py-2 pr-6 font-semibold text-[var(--foreground)]">Event</th>
                    <th className="text-left py-2 font-semibold text-[var(--foreground)]">When it fires</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['file.created', 'After every successful upload'],
                    ['file.indexed', 'When indexing completes'],
                    ['file.deleted', 'When a file is deleted'],
                  ].map(([ev, when]) => (
                    <tr key={ev} className="border-b border-[var(--border)]/50">
                      <td className="py-2 pr-6 font-mono text-[var(--primary)]">{ev}</td>
                      <td className="py-2 text-[var(--muted-foreground)]">{when}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Table rows={[
              ['GET',    '/api/v1/webhooks', 'Get registered webhook URL'],
              ['PUT',    '/api/v1/webhooks', 'Register / update webhook URL'],
              ['DELETE', '/api/v1/webhooks', 'Remove webhook'],
            ]} />
            <Code>{`curl -X PUT https://filevault.host/api/v1/webhooks \\
  -H "Authorization: Bearer fv_sk_..." \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://myapp.example.com/hooks/filevault"}'`}</Code>
          </section>

          {/* MCP */}
          <section id="mcp" className="scroll-mt-24">
            <H2 id="mcp">MCP server</H2>
            <P>FileVault ships an MCP server (<Inline>src/mcp/server.ts</Inline>) so any MCP-compatible client — Claude Desktop, Cursor, Cline — can use it without writing code.</P>
            <Callout kind="info">
              The MCP server is bundled in the repo, not published as a standalone npm package. You need a local clone to run it.
            </Callout>
            <H3>Setup (Claude Desktop)</H3>
            <Code>{`// ~/.claude/claude_desktop_config.json
{
  "mcpServers": {
    "filevault": {
      "command": "npx",
      "args": ["tsx", "/path/to/filevault/src/mcp/server.ts"],
      "env": { "FILEVAULT_API_KEY": "fv_sk_..." }
    }
  }
}`}</Code>
            <P>Replace <Inline>/path/to/filevault</Inline> with your local clone path. <Inline>tsx</Inline> must be installed globally: <Inline>npm install -g tsx</Inline>.</P>
            <H3>Available tools</H3>
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="text-left py-2 pr-6 font-semibold text-[var(--foreground)]">Tool</th>
                    <th className="text-left py-2 font-semibold text-[var(--foreground)]">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['filevault_upload_file', 'Upload and optionally index a file'],
                    ['filevault_search', 'Semantic search across files and memory'],
                    ['filevault_store_memory', 'Store agent memory with optional TTL'],
                    ['filevault_list_files', 'List stored files'],
                    ['filevault_get_usage', 'Get usage statistics'],
                  ].map(([tool, desc]) => (
                    <tr key={tool} className="border-b border-[var(--border)]/50">
                      <td className="py-2 pr-6 font-mono text-[var(--primary)] whitespace-nowrap">{tool}</td>
                      <td className="py-2 text-[var(--muted-foreground)]">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Human hosting */}
          <section id="human-hosting" className="scroll-mt-24">
            <H2 id="human-hosting">Human hosting</H2>
            <P>Drop a ZIP or HTML file on the <Link href="/" className="text-[var(--primary)] hover:underline">homepage</Link> and get a shareable link in seconds. No account required.</P>
            <div className="overflow-x-auto mb-5">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    {['Feature', 'Anonymous', 'Free', 'Pro'].map(h => (
                      <th key={h} className="text-left py-2 pr-6 font-semibold text-[var(--foreground)]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Max upload', '5 MB', '10 MB', '100 MB'],
                    ['Link expiry', '24 h', '30 days', 'Never'],
                    ['Max links', '3 / day', '10 total', 'Unlimited'],
                    ['Password protection', '—', '✓', '✓'],
                    ['Custom domain', '—', '—', '✓'],
                  ].map(([feat, anon, free, pro]) => (
                    <tr key={feat} className="border-b border-[var(--border)]/50">
                      <td className="py-2 pr-6 font-medium text-[var(--foreground)]">{feat}</td>
                      <td className="py-2 pr-6 text-[var(--muted-foreground)]">{anon}</td>
                      <td className="py-2 pr-6 text-[var(--muted-foreground)]">{free}</td>
                      <td className="py-2 text-[var(--muted-foreground)]">{pro}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <H3>Custom domains (Pro)</H3>
            <P>Add a CNAME record pointing to <Inline>filevault.host</Inline>, then enter your domain in the dashboard card for that deployment. Traffic to your domain is proxied to the right slug automatically.</P>
          </section>

          {/* Troubleshooting */}
          <section id="troubleshooting" className="scroll-mt-24">
            <H2 id="troubleshooting">Troubleshooting</H2>

            <H3>401 Unauthorized</H3>
            <P>Check that your header is exactly <Inline>Authorization: Bearer fv_sk_...</Inline> with no extra spaces or quotes. API keys are shown once at creation — if you lost yours, create a new agent.</P>

            <H3>Search returns no results after upload</H3>
            <P>The file needs to be indexed first. Either upload with <Inline>index=true</Inline>, or call <Inline>POST /api/v1/files/:id/index</Inline> afterwards. Poll <Inline>GET /api/v1/files/:id</Inline> and wait for <Inline>index_status: &quot;indexed&quot;</Inline> before searching.</P>

            <H3>429 Too Many Requests</H3>
            <P>The upload rate limit is 20 files per minute per agent. The response includes <Inline>retry_after_seconds</Inline>. Use <Inline>/api/v1/files/batch</Inline> to upload up to 10 files as a single request.</P>

            <H3>File uploaded but not returning a download URL</H3>
            <P><Inline>GET /api/v1/files/:id</Inline> returns metadata only. Files stored in Cloudflare R2 are served via a CDN redirect — the <Inline>storage_key</Inline> field in the response maps to the R2 object key.</P>

            <H3>Checking usage</H3>
            <P><Inline>GET /api/v1/usage</Inline> returns your current file count, indexed count, storage bytes, embedding count, memory count, and state checkpoint count in a single call.</P>

            {/* Contact */}
            <div className="mt-10 rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
              <p className="text-sm font-semibold text-[var(--foreground)] mb-1">Still stuck?</p>
              <p className="text-sm text-[var(--muted-foreground)] mb-4">Email us and we&apos;ll get back to you within 24 hours.</p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="mailto:support@filevault.host"
                  className="rounded-lg bg-[var(--primary)] px-4 py-2 text-xs font-medium text-white hover:bg-[#1446c0] transition-colors"
                >
                  support@filevault.host
                </a>
                <a
                  href="mailto:abuse@filevault.host"
                  className="rounded-lg border border-[var(--border)] px-4 py-2 text-xs font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                >
                  Report abuse
                </a>
              </div>
            </div>
          </section>

        </main>
      </div>
    </div>
  )
}
