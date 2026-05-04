import { prisma } from '@/lib/prisma'

export type WebhookEvent =
  | { event: 'file.created'; data: { file_id: string; name: string; size_bytes: number; is_indexed: boolean } }
  | { event: 'file.deleted'; data: { file_id: string } }
  | { event: 'file.indexed'; data: { file_id: string; chunks_created: number } }
  | { event: 'memory.created'; data: { memory_id: string } }

export async function fireWebhook(agentId: string, payload: WebhookEvent): Promise<void> {
  const agent = await prisma.agent.findUnique({ where: { id: agentId }, select: { webhookUrl: true } })
  if (!agent?.webhookUrl) return

  try {
    await fetch(agent.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-FileVault-Event': payload.event },
      body: JSON.stringify({ ...payload, timestamp: new Date().toISOString() }),
      signal: AbortSignal.timeout(5000),
    })
  } catch {
    // Non-blocking — webhook failures are silent
  }
}
