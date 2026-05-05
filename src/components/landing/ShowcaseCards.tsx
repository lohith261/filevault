'use client'

import { motion } from 'framer-motion'

const SHOWCASES = [
  {
    title: 'Research Agent',
    endpoint: 'POST /v1/search',
    description: 'Ingest 100+ papers, query across them in natural language.',
  },
  {
    title: 'Customer Support',
    endpoint: 'POST /v1/memory',
    description: 'Remember customer preferences and prior issues across sessions.',
  },
  {
    title: 'Multi-Agent Team',
    endpoint: 'POST /v1/shares',
    description: 'Three agents share a knowledge base without sharing API keys.',
  },
]

export function ShowcaseCards() {
  return (
    <section className="py-20 px-6 border-t border-[var(--border)]">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mb-10"
        >
          <p className="text-[11px] font-mono uppercase tracking-[0.15em] text-[var(--muted-foreground)] mb-3">
            Use cases
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] tracking-tight">
            Built for real agents.
          </h2>
        </motion.div>

        <div className="divide-y divide-[var(--border)] border-t border-[var(--border)]">
          {SHOWCASES.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="py-5 grid grid-cols-12 gap-4 items-center"
            >
              <div className="col-span-12 sm:col-span-3">
                <h3 className="text-sm font-semibold text-[var(--foreground)]">
                  {item.title}
                </h3>
              </div>
              <div className="col-span-12 sm:col-span-4">
                <code className="text-[11px] font-mono text-[var(--brand)]">
                  {item.endpoint}
                </code>
              </div>
              <div className="col-span-12 sm:col-span-5">
                <p className="text-sm text-[var(--muted-foreground)]">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
