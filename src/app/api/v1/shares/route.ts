import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { resolveAgent } from '@/lib/auth/apiKey'

const ShareSchema = z.object({ agent_id: z.string().min(1) })

// GET /v1/shares — list shares given by and received by this agent
export async function GET(req: NextRequest) {
  const agentId = await resolveAgent(req.headers.get('authorization'))
  if (!agentId) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })

  const [given, received] = await Promise.all([
    prisma.agentShare.findMany({
      where: { ownerAgentId: agentId },
      select: { id: true, granteeAgentId: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.agentShare.findMany({
      where: { granteeAgentId: agentId },
      select: { id: true, ownerAgentId: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  return NextResponse.json({
    given: given.map((s) => ({ share_id: s.id, grantee_agent_id: s.granteeAgentId, created_at: s.createdAt })),
    received: received.map((s) => ({ share_id: s.id, owner_agent_id: s.ownerAgentId, created_at: s.createdAt })),
  })
}

// POST /v1/shares — grant read access to another agent
export async function POST(req: NextRequest) {
  const agentId = await resolveAgent(req.headers.get('authorization'))
  if (!agentId) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })

  const parsed = ShareSchema.safeParse(await req.json().catch(() => ({})))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const granteeId = parsed.data.agent_id
  if (granteeId === agentId) {
    return NextResponse.json({ error: 'Cannot share with yourself.' }, { status: 400 })
  }

  const grantee = await prisma.agent.findUnique({ where: { id: granteeId }, select: { id: true } })
  if (!grantee) return NextResponse.json({ error: 'Grantee agent not found.' }, { status: 404 })

  const share = await prisma.agentShare.upsert({
    where: { ownerAgentId_granteeAgentId: { ownerAgentId: agentId, granteeAgentId: granteeId } },
    create: { ownerAgentId: agentId, granteeAgentId: granteeId },
    update: {},
  })

  return NextResponse.json(
    { share_id: share.id, grantee_agent_id: share.granteeAgentId, created_at: share.createdAt },
    { status: 201 }
  )
}
