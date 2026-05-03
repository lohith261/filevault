import crypto from 'crypto'
import { prisma } from '@/lib/prisma'

const PREFIX = 'fv_sk_'

// SHA-256 is appropriate here: API keys are already 256 bits of entropy,
// so bcrypt's slow hashing adds no security benefit over a fast digest.
export function generateApiKey(): string {
  return PREFIX + crypto.randomBytes(32).toString('hex')
}

export function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex')
}

export async function resolveAgent(
  authHeader: string | null
): Promise<string | null> {
  if (!authHeader?.startsWith('Bearer ')) return null
  const key = authHeader.slice(7).trim()
  if (!key.startsWith(PREFIX)) return null

  const hash = hashApiKey(key)
  const agent = await prisma.agent.findUnique({
    where: { apiKeyHash: hash },
    select: { id: true },
  })
  return agent?.id ?? null
}
