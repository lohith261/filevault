import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { resolveAgent } from '@/lib/auth/apiKey'
import { storageDriver } from '@/lib/storage'
import { indexFile, streamToBuffer } from '@/lib/indexing'

export const maxDuration = 60

type Params = { params: Promise<{ id: string }> }

// POST /v1/files/:id/index — index an already-uploaded file on demand
export async function POST(req: NextRequest, { params }: Params) {
  const agentId = await resolveAgent(req.headers.get('authorization'))
  if (!agentId) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })

  const { id } = await params
  const file = await prisma.agentFile.findFirst({ where: { id, agentId } })
  if (!file) return NextResponse.json({ error: 'File not found.' }, { status: 404 })

  if (file.isIndexed) {
    return NextResponse.json({ already_indexed: true, file_id: file.id })
  }

  try {
    const stream = await storageDriver.getFileStream(file.storageKey)
    const buffer = await streamToBuffer(stream)

    const result = await indexFile(agentId, file.id, buffer, file.mimeType, file.name)

    if (result.indexed) {
      await prisma.agentFile.update({ where: { id: file.id }, data: { isIndexed: true } })
    }

    return NextResponse.json({
      file_id: file.id,
      indexed: result.indexed,
      chunks_created: result.chunksCreated,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Indexing failed.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
