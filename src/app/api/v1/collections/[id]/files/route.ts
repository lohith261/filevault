import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { resolveAgent } from '@/lib/auth/apiKey'

type Params = { params: Promise<{ id: string }> }

const AddFileSchema = z.object({ file_id: z.string().min(1) })

// POST /v1/collections/:id/files — add a file to a collection
export async function POST(req: NextRequest, { params }: Params) {
  const agentId = await resolveAgent(req.headers.get('authorization'))
  if (!agentId) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })

  const { id } = await params
  const collection = await prisma.collection.findFirst({ where: { id, agentId } })
  if (!collection) return NextResponse.json({ error: 'Collection not found.' }, { status: 404 })

  const parsed = AddFileSchema.safeParse(await req.json().catch(() => ({})))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const file = await prisma.agentFile.findFirst({ where: { id: parsed.data.file_id, agentId } })
  if (!file) return NextResponse.json({ error: 'File not found.' }, { status: 404 })

  await prisma.collectionFile.upsert({
    where: { collectionId_fileId: { collectionId: id, fileId: file.id } },
    create: { collectionId: id, fileId: file.id },
    update: {},
  })

  return new NextResponse(null, { status: 204 })
}
