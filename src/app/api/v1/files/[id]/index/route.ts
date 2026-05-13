import { NextRequest, NextResponse } from 'next/server'
import { after } from 'next/server'
import { prisma } from '@/lib/prisma'
import { resolveAgent } from '@/lib/auth/apiKey'
import { storageDriver } from '@/lib/storage'
import { runIndexingJob, streamToBuffer } from '@/lib/indexing'

export const maxDuration = 60

type Params = { params: Promise<{ id: string }> }

// POST /v1/files/:id/index — queue indexing for an already-uploaded file
// Returns immediately with index_status: "pending"; poll GET /v1/files/:id for progress.
export async function POST(req: NextRequest, { params }: Params) {
  const agentId = await resolveAgent(req.headers.get('authorization'))
  if (!agentId) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })

  const { id } = await params
  const file = await prisma.agentFile.findFirst({ where: { id, agentId } })
  if (!file) return NextResponse.json({ error: 'File not found.' }, { status: 404 })

  if (file.indexStatus === 'indexed' || file.isIndexed) {
    return NextResponse.json({ already_indexed: true, file_id: file.id, index_status: 'indexed' })
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

    await prisma.agentFile.update({
      where: { id: file.id },
      data: { indexStatus: 'pending' },
    })

    after(async () => {
      await runIndexingJob(agentId, file.id, buffer, file.mimeType, file.name)
    })

    return NextResponse.json({
      file_id: file.id,
      index_status: 'pending',
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Indexing failed.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
