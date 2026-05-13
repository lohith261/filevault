import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { resolveAgent } from '@/lib/auth/apiKey'

type Params = { params: Promise<{ id: string }> }

// DELETE /v1/memory/:id — delete a single memory entry
export async function DELETE(req: NextRequest, { params }: Params) {
  const agentId = await resolveAgent(req.headers.get('authorization'))
  if (!agentId) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })

  const { id } = await params

  const memory = await prisma.memory.findFirst({ where: { id, agentId } })
  if (!memory) return NextResponse.json({ error: 'Memory not found.' }, { status: 404 })

  await prisma.memory.delete({ where: { id } })

  return new NextResponse(null, { status: 204 })
}
