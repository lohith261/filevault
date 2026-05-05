'use client'

import { motion } from 'framer-motion'

const TESTIMONIALS = [
  {
    quote: 'We replaced S3 + Pinecone + a custom auth layer with FileVault in a single afternoon. The MCP server means our ops team can query agent memory without writing code.',
    author: 'Engineering Lead',
    org: 'AI Infrastructure, Series B Startup',
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-24 px-6 border-t border-[var(--border)]">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <p className="text-[11px] font-mono uppercase tracking-[0.15em] text-[var(--muted-foreground)] mb-8">
            Testimonials
          </p>

          {TESTIMONIALS.map((t) => (
            <div key={t.author} className="space-y-6">
              <blockquote className="text-xl sm:text-2xl font-medium text-[var(--foreground)] leading-snug tracking-tight">
                "{t.quote}"
              </blockquote>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-sm bg-[var(--muted)] flex items-center justify-center">
                  <span className="text-xs font-mono text-[var(--muted-foreground)]">
                    {t.author.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--foreground)]">{t.author}</p>
                  <p className="text-[11px] font-mono text-[var(--muted-foreground)]">{t.org}</p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
