'use client'

import { motion } from 'framer-motion'

export function TestimonialsSection() {
  return (
    <section className="py-16 px-6 border-t border-[var(--border)]">
      <div className="mx-auto max-w-3xl">
        <motion.figure
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          {/* Decorative quotation mark */}
          <span
            className="block leading-none text-[var(--primary)] select-none"
            style={{ fontSize: '6rem', opacity: 0.12, fontFamily: 'Georgia, serif', lineHeight: 1 }}
            aria-hidden="true"
          >
            &ldquo;
          </span>

          <blockquote className="text-xl sm:text-2xl font-medium text-[var(--foreground)] leading-relaxed -mt-4">
            It took exactly 10 seconds to upload my resume and get a shareable link.
            I was shocked by the speed of it.
          </blockquote>

          <figcaption className="mt-8 flex items-center justify-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary)]/10 text-sm font-bold text-[var(--primary)]">
              H
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-[var(--foreground)]">Hemanth A.</p>
              <p className="text-xs text-[var(--muted-foreground)]">Early user</p>
            </div>
          </figcaption>
        </motion.figure>
      </div>
    </section>
  )
}
