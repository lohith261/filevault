'use client'

import { motion } from 'framer-motion'

const FEATURES = [
  {
    num: '01',
    title: 'Semantic file storage',
    description: 'Upload any file and automatically extract, chunk, and embed it for natural language search. PDFs, HTML, JSON, TXT — all become queryable.',
    spec: 'pgvector HNSW · 1536-dim · <50ms p99',
  },
  {
    num: '02',
    title: 'Agent memory',
    description: 'Persistent working memory with TTL support. Store preferences, facts, and context that survives across sessions.',
    spec: '5,000 entries · vector(1536) · TTL support',
  },
  {
    num: '03',
    title: 'Agent-to-agent sharing',
    description: 'Grant read access to your file embeddings to other agents. Build multi-agent systems that share knowledge, not credentials.',
    spec: 'Cross-agent ACL · embedding-level grants',
  },
  {
    num: '04',
    title: 'Collections & scoping',
    description: 'Group files into named collections. Search within a project, a client, or a time period — never wade through irrelevant results.',
    spec: 'Unlimited collections · metadata filtering',
  },
  {
    num: '05',
    title: 'Event-driven webhooks',
    description: 'Register a URL and get notified when files are uploaded, indexed, or deleted. Build reactive agent workflows.',
    spec: '4 events · SSRF-protected · signed payloads',
  },
  {
    num: '06',
    title: 'MCP Server',
    description: 'Plug FileVault directly into Claude Desktop, Cursor, Cline, or any MCP-compatible client. No code required.',
    spec: 'stdio transport · 5 tools · Zod schemas',
  },
]

export function FeaturesSection() {
  return (
    <section className="relative py-24 px-6 border-t border-[var(--border)]">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mb-14"
        >
          <p className="text-[11px] font-mono uppercase tracking-[0.15em] text-[var(--muted-foreground)] mb-3">
            Capabilities
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] tracking-tight">
            Everything an agent needs.
          </h2>
        </motion.div>

        <div className="divide-y divide-[var(--border)]">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.num}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="py-5 grid grid-cols-12 gap-4 items-start group"
            >
              <div className="col-span-1">
                <span className="text-[11px] font-mono text-[var(--muted-foreground)]">
                  {feature.num}
                </span>
              </div>
              <div className="col-span-3 sm:col-span-2">
                <h3 className="text-sm font-semibold text-[var(--foreground)]">
                  {feature.title}
                </h3>
              </div>
              <div className="col-span-8 sm:col-span-6">
                <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                  {feature.description}
                </p>
              </div>
              <div className="col-span-12 sm:col-span-3 sm:text-right">
                <span className="text-[10px] font-mono text-[var(--brand)] uppercase tracking-wider">
                  {feature.spec}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
