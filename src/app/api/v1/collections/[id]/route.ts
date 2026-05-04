import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { resolveAgent } from '@/lib/auth/apiKey'

type Params = { params: Promise<{ id: string }> }

// GET /v1/collections/:id — get collection with its files
export async function GET(req: NextRequest, { params }: Params) {
  const agentId = await resolveAgent(req.headers.get('authorization'))
  if (!agentId) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })

  const { id } = await params
  const collection = await prisma.collection.findFirst({
    where: { id, agentId },
    include: {
      files: {
        orderBy: { addedAt: 'desc' },
        include: {
          file: {
            select: { id: true, name: true, mimeType: true, sizeBytes: true, isIndexed: true, createdAt: true },
          },
        },
      },
    },
  })

  if (!collection) return NextResponse.json({ error: 'Collection not found.' }, { status: 404 })

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? ''
  return NextResponse.json({
    collection_id: collection.id,
    name: collection.name,
    created_at: collection.createdAt,
    files: collection.files.map(({ file }) => ({
      file_id: file.id,
      name: file.name,
      mime_type: file.mimeType,
      size_bytes: Number(file.sizeBytes),
      is_indexed: file.isIndexed,
      url: `${baseUrl}/api/v1/files/${file.id}`,
      created_at: file.createdAt,
    })),
  })
}

// DELETE /v1/collections/:id
export async function DELETE(req: NextRequest, { params }: Params) {
  const agentId = await resolveAgent(req.headers.get('authorization'))
  if (!agentId) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })

  const { id } = await params
  const collection = await prisma.collection.findFirst({ where: { id, agentId } })
  if (!collection) return NextResponse.json({ error: 'Collection not found.' }, { status: 404 })

  await prisma.collection.delete({ where: { id } })
  return new NextResponse(null, { status: 204 })
}
