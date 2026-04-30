import { prisma } from './prisma'

// Simple in-memory dedup: ip+slug+hourBucket
const recentViews = new Map<string, number>()

export async function recordView(siteId: string, ip: string | null, userAgent: string | null) {
  const hour = Math.floor(Date.now() / (1000 * 60 * 60))
  const key = `${siteId}:${ip}:${hour}`

  if (recentViews.has(key)) return

  recentViews.set(key, Date.now())

  // Evict old entries every 1000 inserts
  if (recentViews.size > 1000) {
    const cutoff = Date.now() - 2 * 60 * 60 * 1000
    for (const [k, ts] of recentViews.entries()) {
      if (ts < cutoff) recentViews.delete(k)
    }
  }

  await prisma.siteView.create({
    data: { siteId, ip, userAgent },
  }).catch(() => {})
}

export async function getAnalytics(siteId: string) {
  const now = new Date()
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const [totalViews, views24h, views7d] = await Promise.all([
    prisma.siteView.count({ where: { siteId } }),
    prisma.siteView.count({ where: { siteId, viewedAt: { gte: last24h } } }),
    prisma.siteView.count({ where: { siteId, viewedAt: { gte: last7d } } }),
  ])

  return { totalViews, views24h, views7d }
}
