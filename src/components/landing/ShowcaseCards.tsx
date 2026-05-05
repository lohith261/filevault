'use client'

import { motion } from 'framer-motion'

const SHOWCASE_CARDS = [
  {
    badge: 'Research Agent',
    url: 'POST /v1/files',
    description: 'Upload 100 PDFs, index them all, and search across the corpus in natural language.',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    badge: 'Customer Support',
    url: 'POST /v1/memory',
    description: 'Store user preferences and conversation history. Recall them across sessions with semantic search.',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    badge: 'Multi-Agent Team',
    url: 'POST /v1/shares',
    description: 'One agent indexes the docs. Three others query them. No copy-pasting vector databases.',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
      </svg>
    ),
  },
]

export function ShowcaseCards() {
  return (
    <div>
      <p className="mb-6 text-center text-xs font-semibold uppercase tracking-widest text-[var(--muted-foreground)]">
        What agents build
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {SHOWCASE_CARDS.map((card, i) => (
          <motion.div
            key={card.badge}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="group rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 hover:border-[var(--brand)]/20 hover:shadow-lg hover:shadow-[var(--brand-glow)]/10 hover:-translate-y-0.5 transition-all duration-300"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--brand-muted)] text-[var(--brand)] border border-[var(--brand)]/10">
                {card.icon}
              </div>
              <span className="rounded-full bg-[var(--brand-muted)] px-2.5 py-0.5 text-xs font-semibold text-[var(--brand)]">
                {card.badge}
              </span>
            </div>
            <p className="mb-2 font-mono text-xs text-[var(--muted-foreground)]">{card.url}</p>
            <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">{card.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
