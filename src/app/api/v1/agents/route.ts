import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { generateApiKey, hashApiKey } from '@/lib/auth/apiKey'

const CreateAgentSchema = z.object({
  name: z.string().max(100).optional(),
})

// POST /v1/agents
// Creates an agent and returns a plaintext API key (shown exactly once).
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const parsed = CreateAgentSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const plainKey = generateApiKey()
    const agent = await prisma.agent.create({
      data: {
        name: parsed.data.name ?? null,
        apiKeyHash: hashApiKey(plainKey),
      },
    })

    return NextResponse.json(
      {
        agent_id: agent.id,
        name: agent.name,
        api_key: plainKey, // shown once — not stored in plaintext
        created_at: agent.createdAt,
      },
      { status: 201 }
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create agent.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
