'use client'

import { motion } from 'framer-motion'

const FEATURES = [
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'Instant deployment',
    description: 'From upload to live URL in under 3 seconds. No build step, no config, no waiting. Drop and go.',
    featured: true,
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    title: 'ZIP support',
    description: 'Upload an entire static site as a ZIP. We unzip, detect the entry point, and host everything.',
    featured: false,
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    title: 'Password protection',
    description: 'Lock any deployment behind a password. Share privately with clients or teammates.',
    featured: false,
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Auto-expiry',
    description: 'Set links to auto-delete after 1h, 24h, 7d, or 30 days. Or keep them forever on Pro.',
    featured: false,
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'Analytics',
    description: 'Track views per deployment. See 24h, 7d, and all-time stats right from your dashboard.',
    featured: false,
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
    title: 'Custom subdomains',
    description: 'Pick a memorable link name. Your site lives at myproject.filevault.host — free for all signed-in users.',
    featured: false,
  },
]

export function FeaturesSection() {
  const [featured, ...rest] = FEATURES

  return (
    <section className="py-24 px-6 border-t border-[var(--border)]">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h2 className="text-4xl font-bold text-[var(--foreground)]">Everything you need</h2>
          <p className="mt-3 text-[var(--muted-foreground)] max-w-md">
            Simple enough for a quick demo, powerful enough for production previews.
          </p>
        </motion.div>

        {/* Featured card — full width */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mb-4 rounded-xl border border-[var(--border)] bg-[var(--card)] p-8 flex flex-col sm:flex-row sm:items-center gap-6 hover:border-[var(--foreground)]/20 transition-colors duration-200"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)]">
            {featured.icon}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-[var(--foreground)]">{featured.title}</h3>
            <p className="mt-1.5 text-[var(--muted-foreground)] leading-relaxed max-w-xl">{featured.description}</p>
          </div>
          <div className="sm:ml-auto shrink-0">
            <span className="rounded-full border border-[var(--border)] bg-[var(--muted)] px-3 py-1 text-xs font-medium text-[var(--muted-foreground)]">
              Under 3 seconds
            </span>
          </div>
        </motion.div>

        {/* Rest — 2-col then 3-col grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rest.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 hover:border-[var(--foreground)]/20 transition-colors duration-200"
            >
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)]">
                {feature.icon}
              </div>
              <h3 className="font-semibold text-[var(--foreground)]">{feature.title}</h3>
              <p className="mt-1.5 text-sm text-[var(--muted-foreground)] leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
