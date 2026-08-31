import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUserId } from '@/lib/auth/dashboardAgent'
import { generateApiKey, hashApiKey } from '@/lib/auth/apiKey'

// GET /api/dashboard/agents — list all agents belonging to the signed-in user
export async function GET() {
  const userId = await requireUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })

  const agents = await prisma.agent.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, createdAt: true },
  })

  return NextResponse.json({ agents })
}

// POST /api/dashboard/agents — create a new agent tied to the signed-in user
export async function POST(req: NextRequest) {
  const userId = await requireUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const name: string | undefined = typeof body.name === 'string' ? body.name : undefined

  const rawKey = generateApiKey()
  const apiKeyHash = hashApiKey(rawKey)

  const agent = await prisma.agent.create({
    data: { name, apiKeyHash, userId },
    select: { id: true, name: true, createdAt: true },
  })

  return NextResponse.json({ agent_id: agent.id, name: agent.name, api_key: rawKey }, { status: 201 })
}
