import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { resolveAgent } from '@/lib/auth/apiKey'
import { storageDriver } from '@/lib/storage'
import { runIndexingJob, streamToBuffer } from '@/lib/indexing'

export const maxDuration = 60

type Params = { params: Promise<{ id: string }> }

// POST /v1/files/:id/index — index an already-uploaded file on demand
export async function POST(req: NextRequest, { params }: Params) {
  const agentId = await resolveAgent(req.headers.get('authorization'))
  if (!agentId) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })

  const { id } = await params
  const file = await prisma.agentFile.findFirst({ where: { id, agentId } })
  if (!file) return NextResponse.json({ error: 'File not found.' }, { status: 404 })

  if (file.indexStatus === 'indexed' || file.isIndexed) {
    return NextResponse.json({ already_indexed: true, file_id: file.id })
  }

  if (file.indexStatus === 'pending' || file.indexStatus === 'indexing') {
    return NextResponse.json(
      { error: 'File is already being indexed.', file_id: file.id, index_status: file.indexStatus },
      { status: 429 }
    )
  }

  try {
    const stream = await storageDriver.getFileStream(file.storageKey)
    const buffer = await streamToBuffer(stream)

    await runIndexingJob(agentId, file.id, buffer, file.mimeType, file.name)

    const updated = await prisma.agentFile.findUnique({ where: { id: file.id } })

    return NextResponse.json({
      file_id: file.id,
      indexed: updated?.indexStatus === 'indexed',
      index_status: updated?.indexStatus,
      chunks_created: updated?.indexStatus === 'indexed' ? await prisma.embedding.count({ where: { fileId: file.id } }) : 0,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Indexing failed.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
