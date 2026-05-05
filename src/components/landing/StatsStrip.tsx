'use client'

import { motion } from 'framer-motion'

interface StatsStripProps {
  agents: number
  files: number
}

export function StatsStrip({ agents, files }: StatsStripProps) {
  const stats = [
    { label: 'Active agents', value: agents.toLocaleString() },
    { label: 'Files stored', value: files.toLocaleString() },
    { label: 'Index latency', value: '< 3s' },
    { label: 'Query latency', value: '< 50ms' },
  ]

  return (
    <section className="border-b border-[var(--border)]">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-wrap items-center divide-x divide-[var(--border)]">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="flex-1 min-w-[140px] px-5 py-4 first:pl-0"
            >
              <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted-foreground)] mb-1">
                {stat.label}
              </p>
              <p className="text-lg font-mono text-[var(--foreground)] tabular-nums tracking-tight">
                {stat.value}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
