import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { resolveUserAgent } from '@/lib/auth/dashboardAgent'
import { generateEmbedding } from '@/lib/embeddings'
import { checkMemoryCapacity } from '@/lib/agentLimits'

type Params = { params: Promise<{ id: string }> }

const StoreMemorySchema = z.object({
  content: z.string().min(1).max(10000),
  ttl: z.number().int().positive().optional(),
})

// POST /api/dashboard/agents/[id]/memory
export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params
  const agent = await resolveUserAgent(id)
  if (!agent) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const parsed = StoreMemorySchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { content, ttl } = parsed.data

  const cap = await checkMemoryCapacity(id)
  if (!cap.allowed) return NextResponse.json({ error: cap.reason }, { status: 429 })

  const vector = await generateEmbedding(content)
  const expiresAt = ttl ? new Date(Date.now() + ttl * 1000) : null
  const vectorLiteral = `[${vector.join(',')}]`

  const result = await prisma.$queryRaw<[{ id: string; createdAt: Date }]>`
    INSERT INTO memories (id, "agentId", content, vector, "expiresAt", "createdAt")
    VALUES (gen_random_uuid(), ${id}, ${content}, ${vectorLiteral}::vector, ${expiresAt}, NOW())
    RETURNING id, "createdAt"
  `
  const memory = result[0]
  return NextResponse.json(
    { memory_id: memory.id, content, expires_at: expiresAt?.toISOString() ?? null, created_at: memory.createdAt },
    { status: 201 }
  )
}

// GET /api/dashboard/agents/[id]/memory
export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params
  const agent = await resolveUserAgent(id)
  if (!agent) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '50', 10), 100)
  const cursor = searchParams.get('cursor') ?? undefined

  const memories = await prisma.memory.findMany({
    where: {
      agentId: id,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      ...(cursor ? { id: { lt: cursor } } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: { id: true, content: true, expiresAt: true, createdAt: true },
  })

  return NextResponse.json({
    memories: memories.map((m) => ({
      memory_id: m.id, content: m.content,
      expires_at: m.expiresAt?.toISOString() ?? null, created_at: m.createdAt,
    })),
    next_cursor: memories.length === limit ? memories[memories.length - 1]?.id : null,
  })
}
