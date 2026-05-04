import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export type WebhookEvent =
  | { event: 'file.created'; data: { file_id: string; name: string; size_bytes: number; is_indexed: boolean } }
  | { event: 'file.deleted'; data: { file_id: string } }
  | { event: 'file.indexed'; data: { file_id: string; chunks_created: number } }
  | { event: 'memory.created'; data: { memory_id: string } }

// RFC-1918 + link-local + loopback ranges to block SSRF
const PRIVATE_IP_PATTERNS = [
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^169\.254\./,
  /^::1$/,
  /^fc00:/i,
  /^fe80:/i,
]

function isPrivateUrl(rawUrl: string): boolean {
  try {
    const { hostname } = new URL(rawUrl)
    if (hostname === 'localhost') return true
    return PRIVATE_IP_PATTERNS.some((re) => re.test(hostname))
  } catch {
    return true
  }
}

export async function fireWebhook(agentId: string, payload: WebhookEvent): Promise<void> {
  const agent = await prisma.agent.findUnique({ where: { id: agentId }, select: { webhookUrl: true } })
  if (!agent?.webhookUrl) return
  if (isPrivateUrl(agent.webhookUrl)) {
    logger.warn('webhook blocked: private url', { agentId, url: agent.webhookUrl })
    return
  }

  try {
    await fetch(agent.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-FileVault-Event': payload.event },
      body: JSON.stringify({ ...payload, timestamp: new Date().toISOString() }),
      signal: AbortSignal.timeout(5000),
    })
    logger.info('webhook fired', { agentId, event: payload.event })
  } catch (err) {
    logger.warn('webhook delivery failed', { agentId, event: payload.event, error: String(err) })
  }
}
