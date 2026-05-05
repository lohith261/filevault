import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { resolveAgent } from '@/lib/auth/apiKey'

// GET /v1/state/:id
// Retrieve a single state checkpoint.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const agentId = await resolveAgent(_req.headers.get('authorization'))
  if (!agentId) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  const { id } = await params

  const state = await prisma.agentState.findFirst({
    where: { id, agentId },
  })

  if (!state) {
    return NextResponse.json({ error: 'State not found.' }, { status: 404 })
  }

  let parsedData: Record<string, unknown>
  try {
    parsedData = JSON.parse(state.data)
  } catch {
    return NextResponse.json({ error: 'Corrupted state data.' }, { status: 500 })
  }

  return NextResponse.json({
    state_id: state.id,
    key: state.key,
    data: parsedData,
    created_at: state.createdAt,
    updated_at: state.updatedAt,
  })
}

// DELETE /v1/state/:id
// Delete a state checkpoint.
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const agentId = await resolveAgent(_req.headers.get('authorization'))
  if (!agentId) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  const { id } = await params

  const state = await prisma.agentState.findFirst({
    where: { id, agentId },
  })

  if (!state) {
    return NextResponse.json({ error: 'State not found.' }, { status: 404 })
  }

  await prisma.agentState.delete({ where: { id } })
  return new NextResponse(null, { status: 204 })
}
