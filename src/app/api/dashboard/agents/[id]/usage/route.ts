import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { resolveUserAgent } from '@/lib/auth/dashboardAgent'

type Params = { params: Promise<{ id: string }> }

// GET /api/dashboard/agents/[id]/usage
export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params
  const agent = await resolveUserAgent(id)
  if (!agent) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })

  const [files, embeddings, memories] = await Promise.all([
    prisma.agentFile.findMany({ where: { agentId: id }, select: { sizeBytes: true, isIndexed: true } }),
    prisma.embedding.count({ where: { agentId: id } }),
    prisma.memory.count({
      where: { agentId: id, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
    }),
  ])

  return NextResponse.json({
    files: {
      count: files.length,
      indexed: files.filter((f) => f.isIndexed).length,
      storage_bytes: files.reduce((s, f) => s + Number(f.sizeBytes), 0),
    },
    embeddings: { count: embeddings },
    memory: { count: memories },
  })
}
