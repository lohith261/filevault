'use client'

import { motion } from 'framer-motion'

const STEPS = [
  {
    step: '01',
    title: 'Drop your file',
    description: 'Drag and drop a ZIP, HTML, or any static file onto the upload zone.',
  },
  {
    step: '02',
    title: 'We deploy it',
    description: "We extract, process, and host your files in under 3 seconds. No config needed.",
  },
  {
    step: '03',
    title: 'Share the link',
    description: "You get a clean, shareable URL. Copy it, scan the QR code, or send it directly.",
  },
]

export function HowItWorksSection() {
  return (
    <section className="py-24 px-4 border-t border-[var(--border)]">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <h2 className="text-3xl font-bold text-[var(--foreground)]">How it works</h2>
          <p className="mt-3 text-[var(--muted-foreground)]">Three steps. Under 10 seconds total.</p>
        </motion.div>

        <div className="relative">
          {/* Connector line */}
          <div className="absolute left-8 top-8 bottom-8 w-px bg-[var(--border)] hidden sm:block" />

          <div className="space-y-6">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="flex items-start gap-6"
              >
                <div className="relative flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--card)] font-mono text-lg font-bold text-[var(--primary)]">
                  {step.step}
                </div>
                <div className="flex-1 pt-3">
                  <h3 className="text-lg font-semibold text-[var(--foreground)]">{step.title}</h3>
                  <p className="mt-1 text-[var(--muted-foreground)]">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
