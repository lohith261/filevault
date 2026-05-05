import { prisma } from '@/lib/prisma'

// Hard caps per agent — prevents runaway storage and OpenRouter embedding costs.
const AGENT_CAPS = {
  maxFiles: 1_000,
  maxStorageBytes: 1 * 1024 * 1024 * 1024, // 1 GB
  maxEmbeddings: 50_000,
  maxMemories: 5_000,
  maxStates: 1_000,
} as const

export interface CapCheck {
  allowed: boolean
  reason?: string
}

export async function checkFileCapacity(agentId: string): Promise<CapCheck> {
  const [fileCount, storage] = await Promise.all([
    prisma.agentFile.count({ where: { agentId } }),
    prisma.agentFile.aggregate({ where: { agentId }, _sum: { sizeBytes: true } }),
  ])

  if (fileCount >= AGENT_CAPS.maxFiles) {
    return { allowed: false, reason: `File limit reached (max ${AGENT_CAPS.maxFiles}).` }
  }

  const usedBytes = Number(storage._sum.sizeBytes ?? 0)
  if (usedBytes >= AGENT_CAPS.maxStorageBytes) {
    return { allowed: false, reason: 'Storage limit reached (max 1 GB).' }
  }

  return { allowed: true }
}

export async function checkEmbeddingCapacity(agentId: string): Promise<CapCheck> {
  const count = await prisma.embedding.count({ where: { agentId } })
  if (count >= AGENT_CAPS.maxEmbeddings) {
    return { allowed: false, reason: `Embedding limit reached (max ${AGENT_CAPS.maxEmbeddings}).` }
  }
  return { allowed: true }
}

export async function checkMemoryCapacity(agentId: string): Promise<CapCheck> {
  const count = await prisma.memory.count({
    where: { agentId, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
  })
  if (count >= AGENT_CAPS.maxMemories) {
    return { allowed: false, reason: `Memory limit reached (max ${AGENT_CAPS.maxMemories}).` }
  }
  return { allowed: true }
}

export async function checkStateCapacity(agentId: string): Promise<CapCheck> {
  const count = await prisma.agentState.count({ where: { agentId } })
  if (count >= AGENT_CAPS.maxStates) {
    return { allowed: false, reason: `State limit reached (max ${AGENT_CAPS.maxStates}).` }
  }
  return { allowed: true }
}
