import { prisma } from '@/lib/prisma'

const WINDOW_MS = 60 * 1000
const UPLOAD_LIMIT = 20 // uploads per agent per minute

export interface RateLimitResult {
  allowed: boolean
  retryAfterSeconds: number
}

export async function checkUploadRateLimit(agentId: string): Promise<RateLimitResult> {
  const since = new Date(Date.now() - WINDOW_MS)
  const count = await prisma.agentFile.count({
    where: { agentId, createdAt: { gte: since } },
  })
  if (count >= UPLOAD_LIMIT) {
    return { allowed: false, retryAfterSeconds: 60 }
  }
  return { allowed: true, retryAfterSeconds: 0 }
}
