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
    quote: "It took exactly 10 seconds to upload my resume and get a shareable link. I was shocked by the speed of it.",
    name: "Hemanth A.",
    role: "Early user",
    initial: "H",
  },
]

export function TestimonialsSection() {
  const isSingle = TESTIMONIALS.length === 1

  return (
    <section className="py-16 px-6 border-t border-[var(--border)]">
      <div className="mx-auto max-w-5xl">
        <p className="mb-10 text-center text-xs font-semibold uppercase tracking-widest text-[var(--muted-foreground)]">
          What users say
        </p>
        <div className={`grid gap-6 ${isSingle ? 'grid-cols-1 max-w-3xl mx-auto' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
          {TESTIMONIALS.map((t, i) => (
            <motion.figure
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-8 text-center"
            >
              <span
                className="block leading-none text-[var(--primary)] select-none"
                style={{ fontSize: '5rem', opacity: 0.12, fontFamily: 'Georgia, serif', lineHeight: 1 }}
                aria-hidden="true"
              >
                &ldquo;
              </span>
              <blockquote className="text-lg sm:text-xl font-medium text-[var(--foreground)] leading-relaxed -mt-3">
                {t.quote}
              </blockquote>
              <figcaption className="mt-7 flex items-center justify-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary)]/10 text-sm font-bold text-[var(--primary)]">
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
