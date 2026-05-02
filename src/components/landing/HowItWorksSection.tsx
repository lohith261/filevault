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
    description: 'We extract, process, and host your files in under 3 seconds. No config needed.',
  },
  {
    step: '03',
    title: 'Share the link',
    description: 'You get a clean, shareable URL. Copy it, scan the QR code, or send it directly.',
  },
]

export function HowItWorksSection() {
  return (
    <section className="py-20 px-6 border-t border-[var(--border)]">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-14"
        >
          <h2 className="text-4xl font-bold text-[var(--foreground)]">How it works</h2>
          <p className="mt-3 text-[var(--muted-foreground)]">Three steps. Under 10 seconds total.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
          {/* Connecting dashes between steps on desktop */}
          <div className="hidden md:block absolute top-8 left-[calc(33.33%+1rem)] right-[calc(33.33%+1rem)] h-px border-t border-dashed border-[var(--border)]" />

          {STEPS.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="relative"
            >
              {/* Watermark step number */}
              <span className="absolute -top-2 -left-1 text-7xl font-black text-[var(--primary)]/[0.07] leading-none select-none pointer-events-none">
                {step.step}
              </span>
              <div className="relative pt-8">
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary)] text-xs font-bold text-white">
                  {i + 1}
                </div>
                <h3 className="text-lg font-semibold text-[var(--foreground)]">{step.title}</h3>
                <p className="mt-1.5 text-sm text-[var(--muted-foreground)] leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
