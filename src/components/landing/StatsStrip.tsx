'use client'

import { motion } from 'framer-motion'

interface Stat {
  value: string
  label: string
}

export function StatsStrip({ stats }: { stats: Stat[] }) {
  return (
    <div>
      <p className="mb-6 text-center text-xs font-semibold uppercase tracking-widest text-[var(--muted-foreground)]">
        By the numbers
      </p>
      <div className="grid grid-cols-3 divide-x divide-[var(--border)] rounded-xl border border-[var(--border)] bg-[var(--card)]">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="px-6 py-7 text-center"
          >
            <p className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[var(--primary)]">
              {stat.value}
            </p>
            <p className="mt-1.5 text-xs sm:text-sm text-[var(--muted-foreground)]">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
