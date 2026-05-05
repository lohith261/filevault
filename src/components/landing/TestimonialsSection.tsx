'use client'

import { motion } from 'framer-motion'

interface Testimonial {
  quote: string
  name: string
  role: string
  initial: string
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      'Instead of wiring S3, Pinecone, and Redis together, I just use FileVault. My agent has memory, file search, and sharing in one API call.',
    name: 'Hemanth A.',
    role: 'Builder',
    initial: 'H',
  },
]

export function TestimonialsSection() {
  const isSingle = TESTIMONIALS.length === 1

  return (
    <section className="relative py-20 px-6 border-t border-[var(--border)] overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--brand)]/20 to-transparent" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-[var(--brand-muted)]/20 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-5xl">
        <p className="mb-10 text-center text-xs font-semibold uppercase tracking-widest text-[var(--muted-foreground)]">
          What builders say
        </p>
        <div
          className={`grid gap-6 ${
            isSingle ? 'grid-cols-1 max-w-3xl mx-auto' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
          }`}
        >
          {TESTIMONIALS.map((t, i) => (
            <motion.figure
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 text-center overflow-hidden group hover:border-[var(--brand)]/20 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand)]/[0.02] to-[var(--brand-secondary)]/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />

              <span
                className="block leading-none text-[var(--brand)] select-none"
                style={{ fontSize: '5rem', opacity: 0.1, fontFamily: 'Georgia, serif', lineHeight: 1 }}
                aria-hidden="true"
              >
                &ldquo;
              </span>
              <blockquote className="relative text-lg sm:text-xl font-medium text-[var(--foreground)] leading-relaxed -mt-3">
                {t.quote}
              </blockquote>
              <figcaption className="relative mt-7 flex items-center justify-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[var(--brand)] to-[var(--brand-secondary)] text-sm font-bold text-white">
                  {t.initial}
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-[var(--foreground)]">{t.name}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">{t.role}</p>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  )
}
