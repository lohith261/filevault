import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { resolveAgent } from '@/lib/auth/apiKey'
import { checkStateCapacity } from '@/lib/agentLimits'

const StoreStateSchema = z.object({
  key: z.string().min(1).max(256),
  data: z.record(z.string(), z.any()),
})

// POST /v1/state
// Store or update a state checkpoint for the agent.
export async function POST(req: NextRequest) {
  const agentId = await resolveAgent(req.headers.get('authorization'))
  if (!agentId) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const parsed = StoreStateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const { key, data } = parsed.data

    // Upsert: if a state with this key exists, update it; otherwise create new.
    const existing = await prisma.agentState.findFirst({
      where: { agentId, key },
    })

    let state
    if (existing) {
      state = await prisma.agentState.update({
        where: { id: existing.id },
        data: { data: JSON.stringify(data) },
      })
    } else {
      const cap = await checkStateCapacity(agentId)
      if (!cap.allowed) {
        return NextResponse.json({ error: cap.reason }, { status: 429 })
      }
      state = await prisma.agentState.create({
        data: {
          agentId,
          key,
          data: JSON.stringify(data),
        },
      })
    }

    return NextResponse.json(
      {
        state_id: state.id,
        key: state.key,
        created_at: state.createdAt,
        updated_at: state.updatedAt,
      },
      { status: 201 }
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to store state.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// GET /v1/state?limit=20&cursor=<id>
// List state checkpoints for the agent.
export async function GET(req: NextRequest) {
  const agentId = await resolveAgent(req.headers.get('authorization'))
  if (!agentId) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 100)
  const cursor = searchParams.get('cursor') ?? undefined
  const keyFilter = searchParams.get('key') ?? undefined

  const states = await prisma.agentState.findMany({
    where: {
      agentId,
      ...(keyFilter ? { key: { contains: keyFilter } } : {}),
      ...(cursor ? { id: { lt: cursor } } : {}),
    },
    orderBy: { updatedAt: 'desc' },
    take: limit,
    select: { id: true, key: true, createdAt: true, updatedAt: true },
  })

  return NextResponse.json({
    states: states.map((s) => ({
      state_id: s.id,
      key: s.key,
      created_at: s.createdAt,
      updated_at: s.updatedAt,
    })),
    next_cursor: states.length === limit ? states[states.length - 1]?.id : null,
  })
}
