'use client'

import { motion } from 'framer-motion'

const SHOWCASE_CARDS = [
  {
    badge: 'Portfolio',
    url: 'myresume.filevault.host',
    description: 'Share your CV or portfolio with a single link — no hosting account needed.',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    badge: 'Product demo',
    url: 'acme-preview.filevault.host',
    description: 'Send clients a live, clickable prototype before committing to a full deploy.',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    badge: 'Internal tool',
    url: 'q4-report.filevault.host',
    description: 'Password-protect internal dashboards and docs for your team — expires automatically.',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
]

export function ShowcaseCards() {
  return (
    <div>
      <p className="mb-6 text-center text-xs font-semibold uppercase tracking-widest text-[var(--muted-foreground)]">
        What people host
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {SHOWCASE_CARDS.map((card, i) => (
          <motion.div
            key={card.badge}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 hover:shadow-md hover:shadow-black/[0.07] hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--primary)]/8 text-[var(--primary)]">
                {card.icon}
              </div>
              <span className="rounded-full bg-[var(--primary)]/8 px-2.5 py-0.5 text-xs font-semibold text-[var(--primary)]">
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
