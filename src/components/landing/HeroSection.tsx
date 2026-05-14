// Server component — CSS-only animations, zero client JS, zero framer-motion.
// Renders instantly on the server; no hydration needed.

import Link from 'next/link'
import { Button } from '@/components/ui/Button'

const METRICS = [
  { label: 'Active agents', value: '12,847' },
  { label: 'Embeddings indexed', value: '4.2M' },
  { label: 'Avg query latency', value: '23ms' },
  { label: 'Uptime', value: '99.99%' },
]

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden pt-16">
      {/* Subtle grid background */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute inset-0 bg-grid" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-20 lg:py-28 w-full">
        <div className="grid lg:grid-cols-5 gap-16 lg:gap-12 items-start">
          {/* Left: Copy (3 cols) */}
          <div className="lg:col-span-3 animate-fade-in-up">
            <p className="text-[11px] font-mono uppercase tracking-[0.15em] text-[var(--muted-foreground)] mb-6">
              Infrastructure for autonomous systems
            </p>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold leading-[1.02] tracking-tighter text-[var(--foreground)]">
              The storage layer AI agents actually need.
            </h1>

            <p className="mt-6 max-w-lg text-base text-[var(--muted-foreground)] leading-relaxed">
              Files, memory, semantic search, and agent-to-agent sharing — all through one API.
              No more duct-taping S3 to Pinecone to Redis.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/agents">
                <Button
                  size="lg"
                  className="bg-[var(--brand)] text-[var(--brand-foreground)] hover:opacity-90 px-5 text-sm font-medium"
                >
                  Get API Key
                </Button>
              </Link>
              <Link href="/help" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors ml-2">
                Read the docs →
              </Link>
            </div>

            <div className="mt-10 flex items-center gap-6 text-[11px] font-mono text-[var(--muted-foreground)] uppercase tracking-wider">
              <span>Zero-dep TS SDK</span>
              <span className="text-[var(--border)]">|</span>
              <span>Python SDK</span>
              <span className="text-[var(--border)]">|</span>
              <span>MCP Compatible</span>
            </div>
          </div>

          {/* Right: System metrics panel (2 cols) */}
          <div className="lg:col-span-2 animate-fade-in-up animation-delay-150">
            <div className="panel rounded-md">
              <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted-foreground)]">
                  System Status
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)]" />
                  <span className="text-[10px] font-mono text-[var(--success)]">OPERATIONAL</span>
                </span>
              </div>
              <div className="divide-y divide-[var(--border)]">
                {METRICS.map((m) => (
                  <div key={m.label} className="px-4 py-3 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-[var(--muted-foreground)] uppercase tracking-wider">
                      {m.label}
                    </span>
                    <span className="text-sm font-mono text-[var(--foreground)] tabular-nums">
                      {m.value}
                    </span>
                  </div>
                ))}
              </div>
              <div className="px-4 py-3 border-t border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-[var(--muted-foreground)]">API:</span>
                  <code className="text-[10px] font-mono text-[var(--brand)]">https://filevault.host/v1</code>
                </div>
              </div>
            </div>

            {/* Quick endpoint reference */}
            <div className="mt-4 panel rounded-md">
              <div className="px-4 py-2.5 border-b border-[var(--border)]">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted-foreground)]">
                  Endpoints
                </span>
              </div>
              <div className="px-4 py-2 space-y-1">
                {[
                  { method: 'POST', path: '/v1/files', desc: 'Upload + index' },
                  { method: 'POST', path: '/v1/search', desc: 'Semantic query' },
                  { method: 'POST', path: '/v1/memory', desc: 'Store memory' },
                ].map((ep) => (
                  <div key={ep.path} className="flex items-center gap-3 text-[11px] font-mono">
                    <span className="text-[var(--brand)] w-10 shrink-0">{ep.method}</span>
                    <span className="text-[var(--foreground)]">{ep.path}</span>
                    <span className="text-[var(--muted-foreground)] ml-auto">{ep.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
