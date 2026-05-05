import { prisma } from '@/lib/prisma'
import { getRedis } from '@/lib/redis'

const WINDOW_MS = 60 * 1000
const UPLOAD_LIMIT = 20 // uploads per agent per minute

export interface RateLimitResult {
  allowed: boolean
  retryAfterSeconds: number
}

// DB-based fallback (used when Redis is not configured)
async function dbRateLimit(agentId: string): Promise<RateLimitResult> {
  const since = new Date(Date.now() - WINDOW_MS)
  const count = await prisma.agentFile.count({
    where: { agentId, createdAt: { gte: since } },
  })
  if (count >= UPLOAD_LIMIT) {
    return { allowed: false, retryAfterSeconds: 60 }
  }
  return { allowed: true, retryAfterSeconds: 0 }
}

// Redis sliding-window rate limiting
async function redisRateLimit(agentId: string): Promise<RateLimitResult> {
  const redis = getRedis()
  if (!redis) return dbRateLimit(agentId)

  const key = `rate_limit:upload:${agentId}`
  const now = Date.now()
  const windowStart = now - WINDOW_MS

  // Remove entries outside the window
  await redis.zremrangebyscore(key, 0, windowStart)

  // Count entries in current window
  const count = await redis.zcard(key)
  if (count >= UPLOAD_LIMIT) {
    // Get the oldest entry to calculate retry-after
    const oldest = await redis.zrange(key, 0, 0, { withScores: true })
    // zrange withScores returns [member, score, member, score...]
    const oldestTime = oldest.length >= 2 ? parseFloat(oldest[1] as string) : windowStart
    const retryAfter = Math.ceil((oldestTime + WINDOW_MS - now) / 1000)
    return { allowed: false, retryAfterSeconds: Math.max(retryAfter, 1) }
  }

  // Add current request
  await redis.zadd(key, { score: now, member: `${now}:${Math.random()}` })
  await redis.expire(key, Math.ceil(WINDOW_MS / 1000) + 1)

  return { allowed: true, retryAfterSeconds: 0 }
}

export async function checkUploadRateLimit(agentId: string): Promise<RateLimitResult> {
  return redisRateLimit(agentId)
}
