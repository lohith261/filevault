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
      <div className="grid grid-cols-3 gap-px rounded-2xl overflow-hidden bg-gradient-to-r from-[var(--brand)]/20 via-[var(--brand-secondary)]/20 to-[var(--info)]/20 p-px">
        <div className="grid grid-cols-3 col-span-3 rounded-2xl overflow-hidden">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="px-4 sm:px-6 py-8 text-center bg-[var(--card)]"
            >
              <p className="text-2xl sm:text-4xl font-extrabold tracking-tight gradient-text">
                {stat.value}
              </p>
              <p className="mt-1.5 text-xs sm:text-sm text-[var(--muted-foreground)]">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
