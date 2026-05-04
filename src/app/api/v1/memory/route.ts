import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { resolveAgent } from '@/lib/auth/apiKey'
import { generateEmbedding } from '@/lib/embeddings'
import { checkMemoryCapacity } from '@/lib/agentLimits'

const StoreMemorySchema = z.object({
  content: z.string().min(1).max(10000),
  // Optional TTL in seconds from now
  ttl: z.number().int().positive().optional(),
})

// POST /v1/memory
// Stores a memory entry with an embedding for later semantic retrieval.
export async function POST(req: NextRequest) {
  const agentId = await resolveAgent(req.headers.get('authorization'))
  if (!agentId) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const parsed = StoreMemorySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const { content, ttl } = parsed.data

    const memoryCap = await checkMemoryCapacity(agentId)
    if (!memoryCap.allowed) {
      return NextResponse.json({ error: memoryCap.reason }, { status: 429 })
    }

    const vector = await generateEmbedding(content)
    const expiresAt = ttl ? new Date(Date.now() + ttl * 1000) : null

    const memory = await prisma.memory.create({
      data: {
        agentId,
        content,
        vector: JSON.stringify(vector),
        expiresAt,
      },
    })

    return NextResponse.json(
      {
        memory_id: memory.id,
        content: memory.content,
        expires_at: memory.expiresAt?.toISOString() ?? null,
        created_at: memory.createdAt,
      },
      { status: 201 }
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to store memory.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// GET /v1/memory?limit=20&cursor=<id>
// Returns the agent's stored memories (paginated), newest first.
export async function GET(req: NextRequest) {
  const agentId = await resolveAgent(req.headers.get('authorization'))
  if (!agentId) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 100)
  const cursor = searchParams.get('cursor') ?? undefined

  const memories = await prisma.memory.findMany({
    where: {
      agentId,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      ...(cursor ? { id: { lt: cursor } } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: { id: true, content: true, expiresAt: true, createdAt: true },
  })

  return NextResponse.json({
    memories: memories.map((m) => ({
      memory_id: m.id,
      content: m.content,
      expires_at: m.expiresAt?.toISOString() ?? null,
      created_at: m.createdAt,
    })),
    next_cursor: memories.length === limit ? memories[memories.length - 1]?.id : null,
  })
}
