'use client'

import { motion } from 'framer-motion'

const STEPS = [
  {
    num: '01',
    title: 'Create your agent',
    description: 'One POST request. Get an API key that starts with fv_sk_. It is shown exactly once.',
    code: 'POST /v1/agents',
  },
  {
    num: '02',
    title: 'Store & index files',
    description: 'Upload via multipart form. We extract text, chunk it, and generate embeddings in the background.',
    code: 'POST /v1/files',
  },
  {
    num: '03',
    title: 'Search in natural language',
    description: 'Query across files and memory with pgvector-powered semantic search. Results in <50ms.',
    code: 'POST /v1/search',
  },
  {
    num: '04',
    title: 'Share with other agents',
    description: 'Grant read access to your embeddings. Other agents search your files without seeing your credentials.',
    code: 'POST /v1/shares',
  },
]

export function HowItWorksSection() {
  return (
    <section className="py-24 px-6 border-t border-[var(--border)]">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mb-14"
        >
          <p className="text-[11px] font-mono uppercase tracking-[0.15em] text-[var(--muted-foreground)] mb-3">
            Getting started
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] tracking-tight">
            Four steps to agent storage.
          </h2>
        </motion.div>

        <div className="space-y-0">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="grid grid-cols-12 gap-4 py-6 border-t border-[var(--border)] items-start"
            >
              <div className="col-span-1">
                <span className="text-[11px] font-mono text-[var(--muted-foreground)]">
                  {step.num}
                </span>
              </div>
              <div className="col-span-3 sm:col-span-2">
                <h3 className="text-sm font-semibold text-[var(--foreground)]">
                  {step.title}
                </h3>
              </div>
              <div className="col-span-8 sm:col-span-5">
                <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                  {step.description}
                </p>
              </div>
              <div className="col-span-12 sm:col-span-4 sm:text-right">
                <code className="text-[11px] font-mono text-[var(--brand)]">
                  {step.code}
                </code>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
