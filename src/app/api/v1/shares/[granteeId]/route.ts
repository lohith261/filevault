import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { resolveAgent } from '@/lib/auth/apiKey'

type Params = { params: Promise<{ granteeId: string }> }

// DELETE /v1/shares/:granteeId — revoke access from a grantee agent
export async function DELETE(req: NextRequest, { params }: Params) {
  const agentId = await resolveAgent(req.headers.get('authorization'))
  if (!agentId) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })

  const { granteeId } = await params
  const deleted = await prisma.agentShare.deleteMany({
    where: { ownerAgentId: agentId, granteeAgentId: granteeId },
  })

  if (deleted.count === 0) return NextResponse.json({ error: 'Share not found.' }, { status: 404 })
  return new NextResponse(null, { status: 204 })
}
