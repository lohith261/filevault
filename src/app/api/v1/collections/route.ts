import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { resolveAgent } from '@/lib/auth/apiKey'

const CreateSchema = z.object({
  name: z.string().min(1).max(100),
})

// GET /v1/collections — list this agent's collections with file counts
export async function GET(req: NextRequest) {
  const agentId = await resolveAgent(req.headers.get('authorization'))
  if (!agentId) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })

  const collections = await prisma.collection.findMany({
    where: { agentId },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { files: true } } },
  })

  return NextResponse.json({
    collections: collections.map((c) => ({
      collection_id: c.id,
      name: c.name,
      file_count: c._count.files,
      created_at: c.createdAt,
    })),
  })
}

// POST /v1/collections — create a collection
export async function POST(req: NextRequest) {
  const agentId = await resolveAgent(req.headers.get('authorization'))
  if (!agentId) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })

  const parsed = CreateSchema.safeParse(await req.json().catch(() => ({})))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const collection = await prisma.collection.create({
    data: { agentId, name: parsed.data.name },
  })

  return NextResponse.json(
    { collection_id: collection.id, name: collection.name, file_count: 0, created_at: collection.createdAt },
    { status: 201 }
  )
}
