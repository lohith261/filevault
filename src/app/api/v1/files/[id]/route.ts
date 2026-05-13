import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { resolveAgent } from '@/lib/auth/apiKey'
import { storageDriver } from '@/lib/storage'
import { fireWebhook } from '@/lib/webhook'

type Params = { params: Promise<{ id: string }> }

async function getOwnedFile(agentId: string, fileId: string) {
  return prisma.agentFile.findFirst({ where: { id: fileId, agentId } })
}

// GET /v1/files/:id — fetch single file metadata
export async function GET(req: NextRequest, { params }: Params) {
  const agentId = await resolveAgent(req.headers.get('authorization'))
  if (!agentId) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })

  const { id } = await params
  const file = await getOwnedFile(agentId, id)
  if (!file) return NextResponse.json({ error: 'File not found.' }, { status: 404 })

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? ''
  return NextResponse.json({
    file_id: file.id,
    name: file.name,
    mime_type: file.mimeType,
    size_bytes: Number(file.sizeBytes),
    is_indexed: file.isIndexed,
    index_status: file.indexStatus,
    metadata: file.metadata ? JSON.parse(file.metadata) : null,
    url: file.storageKey.startsWith('https://') ? file.storageKey : `${baseUrl}/v1/files/${file.id}`,
    created_at: file.createdAt,
  })
}

// DELETE /v1/files/:id — delete file, embeddings (cascade), and storage object
export async function DELETE(req: NextRequest, { params }: Params) {
  const agentId = await resolveAgent(req.headers.get('authorization'))
  if (!agentId) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })

  const { id } = await params
  const file = await getOwnedFile(agentId, id)
  if (!file) return NextResponse.json({ error: 'File not found.' }, { status: 404 })

  // Strip filename to get the storage prefix (works for both R2 URLs and local paths)
  const storagePrefix = file.storageKey.split('/').slice(0, -1).join('/')

  await storageDriver.deletePrefix(storagePrefix)
  // Cascade in schema deletes Embeddings automatically
  await prisma.agentFile.delete({ where: { id: file.id } })

  fireWebhook(agentId, { event: 'file.deleted', data: { file_id: id } })

  return new NextResponse(null, { status: 204 })
}
