import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { resolveAgent } from '@/lib/auth/apiKey'

type Params = { params: Promise<{ id: string; fileId: string }> }

// DELETE /v1/collections/:id/files/:fileId — remove a file from a collection
export async function DELETE(req: NextRequest, { params }: Params) {
  const agentId = await resolveAgent(req.headers.get('authorization'))
  if (!agentId) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })

  const { id, fileId } = await params
  const collection = await prisma.collection.findFirst({ where: { id, agentId } })
  if (!collection) return NextResponse.json({ error: 'Collection not found.' }, { status: 404 })

  await prisma.collectionFile.deleteMany({ where: { collectionId: id, fileId } })
  return new NextResponse(null, { status: 204 })
}
