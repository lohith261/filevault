'use client'

import { motion } from 'framer-motion'

const STEPS = [
  {
    step: '01',
    title: 'Create your agent',
    description:
      'Generate an API key in seconds. Every agent gets its own identity, storage namespace, and rate limits.',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
  {
    step: '02',
    title: 'Store & index files',
    description:
      'Upload PDFs, HTML, JSON, or TXT. We extract text, chunk it, embed it, and make it searchable automatically.',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15m0-3l-3-3m0 0l-3 3m3-3V15" />
      </svg>
    ),
  },
  {
    step: '03',
    title: 'Search in natural language',
    description:
      'Ask questions across files and memory. Get ranked results with cosine similarity scores and source references.',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
    ),
  },
  {
    step: '04',
    title: 'Share with other agents',
    description:
      'Grant read access to your indexed files to other agents. Build collaborative multi-agent systems that share knowledge.',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
      </svg>
    ),
  },
]

export function HowItWorksSection() {
  return (
    <section className="relative py-24 px-6 border-t border-[var(--border)] overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--brand)]/20 to-transparent" />

      <div className="relative mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <h2 className="text-4xl sm:text-5xl font-extrabold text-[var(--foreground)] tracking-tight">
            How it works
          </h2>
          <p className="mt-4 text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">
            Four steps from zero to a fully-memory-enabled agent.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="group relative"
            >
              {/* Connector line (desktop only) */}
              {i < STEPS.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-[calc(50%+2rem)] right-0 h-px">
                  <div className="h-full border-t border-dashed border-[var(--border)]" />
                  <div className="absolute right-0 -top-[3px] w-1.5 h-1.5 rounded-full bg-[var(--border)] group-hover:bg-[var(--brand)] transition-colors" />
                </div>
              )}

              <div className="relative rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 hover:border-[var(--brand)]/20 transition-all duration-300 hover:shadow-lg hover:shadow-[var(--brand-glow)]/10">
                {/* Step number watermark */}
                <span className="absolute -top-2 -right-2 text-6xl font-black text-[var(--brand)]/[0.06] leading-none select-none pointer-events-none">
                  {step.step}
                </span>

                <div className="relative">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--brand-muted)] text-[var(--brand)] border border-[var(--brand)]/10">
                    {step.icon}
                  </div>
                  <h3 className="text-base font-bold text-[var(--foreground)]">{step.title}</h3>
                  <p className="mt-2 text-sm text-[var(--muted-foreground)] leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
