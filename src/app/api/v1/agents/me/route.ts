import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { resolveAgent } from '@/lib/auth/apiKey'

// GET /v1/agents/me — return the current agent's public identity
export async function GET(req: NextRequest) {
  const agentId = await resolveAgent(req.headers.get('authorization'))
  if (!agentId) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })

  const agent = await prisma.agent.findUnique({
    where: { id: agentId },
    select: { id: true, name: true, createdAt: true },
  })
  if (!agent) return NextResponse.json({ error: 'Agent not found.' }, { status: 404 })

  return NextResponse.json({ agent_id: agent.id, name: agent.name, created_at: agent.createdAt })
}
