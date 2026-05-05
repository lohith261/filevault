'use client'

import { motion } from 'framer-motion'

const FEATURES = [
  {
    title: 'Semantic file storage',
    description:
      'Upload any file and automatically extract, chunk, and embed it for natural language search. PDFs, HTML, JSON, TXT — all become queryable.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
      </svg>
    ),
    size: 'large',
  },
  {
    title: 'Agent memory',
    description:
      'Persistent working memory with TTL support. Store preferences, facts, and context that survives across sessions.',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    size: 'small',
  },
  {
    title: 'Agent-to-agent sharing',
    description:
      'Grant read access to your file embeddings to other agents. Build multi-agent systems that share knowledge, not credentials.',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
      </svg>
    ),
    size: 'small',
  },
  {
    title: 'Collections & scoping',
    description:
      'Group files into named collections. Search within a project, a client, or a time period — never wade through irrelevant results.',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
      </svg>
    ),
    size: 'small',
  },
  {
    title: 'Event-driven webhooks',
    description:
      'Register a URL and get notified when files are uploaded, indexed, or deleted. Build reactive agent workflows.',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0M3.124 7.5A8.969 8.969 0 015.292 3m13.416 0a8.969 8.969 0 012.168 4.5" />
      </svg>
    ),
    size: 'small',
  },
  {
    title: 'MCP Server',
    description:
      'Plug FileVault directly into Claude Desktop, Cursor, Cline, or any MCP-compatible client. No code required.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
      </svg>
    ),
    size: 'large',
  },
]

export function FeaturesSection() {
  const large = FEATURES.filter((f) => f.size === 'large')
  const small = FEATURES.filter((f) => f.size === 'small')

  return (
    <section className="relative py-24 px-6 border-t border-[var(--border)] overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-[var(--brand-muted)]/30 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <h2 className="text-4xl sm:text-5xl font-extrabold text-[var(--foreground)] tracking-tight">
            Everything an agent needs.
          </h2>
          <p className="mt-4 text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">
            No more stitching together S3, Pinecone, and Redis. One API for storage,
            memory, search, and sharing.
          </p>
        </motion.div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Large cards */}
          {large.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className={`bento-card group relative rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 overflow-hidden ${
                feature.size === 'large' ? 'md:col-span-2 lg:col-span-2' : ''
              }`}
            >
              {/* Gradient border effect on hover */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[var(--brand)]/5 to-[var(--brand-secondary)]/5 opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="relative">
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--brand-muted)] to-[var(--brand-muted)]/50 text-[var(--brand)] border border-[var(--brand)]/10">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-[var(--foreground)]">{feature.title}</h3>
                <p className="mt-2 text-[var(--muted-foreground)] leading-relaxed max-w-md">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}

          {/* Small cards */}
          {small.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: (i + large.length) * 0.1 }}
              className="bento-card group relative rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 overflow-hidden"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[var(--brand)]/5 to-[var(--brand-secondary)]/5 opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="relative">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--brand-muted)] to-[var(--brand-muted)]/50 text-[var(--brand)] border border-[var(--brand)]/10">
                  {feature.icon}
                </div>
                <h3 className="text-base font-bold text-[var(--foreground)]">{feature.title}</h3>
                <p className="mt-1.5 text-sm text-[var(--muted-foreground)] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
