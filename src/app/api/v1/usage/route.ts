import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { resolveAgent } from '@/lib/auth/apiKey'

// GET /v1/usage — storage and activity metrics for the agent
export async function GET(req: NextRequest) {
  const agentId = await resolveAgent(req.headers.get('authorization'))
  if (!agentId) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })

  const [files, embeddings, memories, states] = await Promise.all([
    prisma.agentFile.findMany({
      where: { agentId },
      select: { sizeBytes: true, isIndexed: true },
    }),
    prisma.embedding.count({ where: { agentId } }),
    prisma.memory.count({
      where: {
        agentId,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    }),
    prisma.agentState.count({ where: { agentId } }),
  ])

  const storageBytes = files.reduce((sum, f) => sum + Number(f.sizeBytes), 0)
  const indexedCount = files.filter((f) => f.isIndexed).length

  return NextResponse.json({
    files: {
      count: files.length,
      indexed: indexedCount,
      storage_bytes: storageBytes,
    },
    embeddings: { count: embeddings },
    memory: { count: memories },
    states: { count: states },
  })
}
