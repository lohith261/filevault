// Server component — no framer-motion, no client JS.

interface StatsStripProps {
  agents: number
  files: number
}

export function StatsStrip({ agents, files }: StatsStripProps) {
  const stats = [
    { label: 'Active agents', value: agents.toLocaleString(), delay: '0ms' },
    { label: 'Files stored', value: files.toLocaleString(), delay: '80ms' },
    { label: 'Index latency', value: '< 3s', delay: '160ms' },
    { label: 'Query latency', value: '< 50ms', delay: '240ms' },
  ]

  return (
    <section className="border-b border-[var(--border)]">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-wrap items-center divide-x divide-[var(--border)]">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex-1 min-w-[140px] px-5 py-4 first:pl-0 animate-fade-in-up"
              style={{ animationDelay: stat.delay }}
            >
              <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted-foreground)] mb-1">
                {stat.label}
              </p>
              <p className="text-lg font-mono text-[var(--foreground)] tabular-nums tracking-tight">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
