import { formatBytes } from '@/lib/utils'
import type { SiteRecord } from '@/hooks/useFiles'

interface StatsBarProps {
  sites: SiteRecord[]
  total: number
}

export function StatsBar({ sites, total }: StatsBarProps) {
  const totalViews = sites.reduce((sum, s) => sum + s.viewCount, 0)
  const totalSize = sites.reduce((sum, s) => sum + Number(s.totalSizeBytes), 0)

  return (
    <div className="flex flex-wrap gap-6 py-4 border-b border-[var(--border)] mb-6">
      {[
        { label: 'Total deployments', value: total.toLocaleString() },
        { label: 'Total views', value: totalViews.toLocaleString() },
        { label: 'Storage used', value: formatBytes(totalSize) },
      ].map((stat) => (
        <div key={stat.label}>
          <p className="text-2xl font-bold text-[var(--foreground)]">{stat.value}</p>
          <p className="text-xs text-[var(--muted-foreground)]">{stat.label}</p>
        </div>
      ))}
    </div>
  )
}
