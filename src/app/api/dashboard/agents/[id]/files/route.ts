import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { resolveUserAgent } from '@/lib/auth/dashboardAgent'
import { storageDriver } from '@/lib/storage'
import { getMimeType } from '@/lib/mime'
import { generateSlug } from '@/lib/slug'
import { runIndexingJob } from '@/lib/indexing'
import { after } from 'next/server'
import { checkUploadRateLimit } from '@/lib/rateLimit'
import { fireWebhook } from '@/lib/webhook'
import { checkFileCapacity } from '@/lib/agentLimits'

export const maxDuration = 60

type Params = { params: Promise<{ id: string }> }

// GET /api/dashboard/agents/[id]/files
export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params
  const agent = await resolveUserAgent(id)
  if (!agent) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const limit = Math.min(Math.max(parseInt(searchParams.get('limit') ?? '100', 10), 1), 100)
  const cursor = searchParams.get('cursor') ?? undefined
  const indexedParam = searchParams.get('indexed')

  const files = await prisma.agentFile.findMany({
    where: {
      agentId: id,
      ...(indexedParam !== null ? { isIndexed: indexedParam === 'true' } : {}),
      ...(cursor ? { id: { lt: cursor } } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? ''
  return NextResponse.json({
    files: files.map((f) => formatFile(f, baseUrl)),
    next_cursor: files.length === limit ? (files[files.length - 1]?.id ?? null) : null,
  })
}

// POST /api/dashboard/agents/[id]/files
export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params
  const agent = await resolveUserAgent(id)
  if (!agent) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })

  const rateLimit = await checkUploadRateLimit(id)
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Try again in 60 seconds.' },
      { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) } }
    )
  }

  try {
    const form = await req.formData()
    const file = form.get('file') as File | null
    const shouldIndex = (form.get('index') as string)?.toLowerCase() === 'true'
    const metadataRaw = form.get('metadata') as string | null

    if (!file) return NextResponse.json({ error: 'No file provided.' }, { status: 400 })

    const fileCap = await checkFileCapacity(id)
    if (!fileCap.allowed) return NextResponse.json({ error: fileCap.reason }, { status: 429 })

    const MAX_FILE_SIZE = 50 * 1024 * 1024
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large. Maximum size is 50 MB.' }, { status: 413 })
    }

    let metadata: Record<string, unknown> | null = null
    if (metadataRaw) {
      try { metadata = JSON.parse(metadataRaw) }
      catch { return NextResponse.json({ error: 'metadata must be valid JSON.' }, { status: 400 }) }
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const mimeType = getMimeType(file.name) || file.type || 'application/octet-stream'
    const slug = generateSlug()

    const prefix = await storageDriver.putFiles(`agents/${id}/${slug}`, [
      { path: file.name, buffer, mimeType, sizeBytes: file.size },
    ])
    const storageKey = `${prefix}/${file.name}`

    const agentFile = await prisma.agentFile.create({
      data: {
        agentId: id,
        name: file.name,
        mimeType,
        sizeBytes: BigInt(file.size),
        storageKey,
        metadata: metadata ? JSON.stringify(metadata) : null,
        isIndexed: false,
      },
    })

    if (shouldIndex) {
      await prisma.agentFile.update({ where: { id: agentFile.id }, data: { indexStatus: 'pending' } })
      after(async () => { await runIndexingJob(id, agentFile.id, buffer, mimeType, file.name) })
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? ''
    fireWebhook(id, {
      event: 'file.created',
      data: { file_id: agentFile.id, name: file.name, size_bytes: file.size, is_indexed: false },
    })

    return NextResponse.json(formatFile(agentFile, baseUrl), { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upload failed.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

function formatFile(
  f: { id: string; name: string; mimeType: string; sizeBytes: bigint; isIndexed: boolean; indexStatus: string; metadata: string | null; storageKey: string; createdAt: Date },
  baseUrl: string
) {
  return {
    file_id: f.id,
    name: f.name,
    mime_type: f.mimeType,
    size_bytes: Number(f.sizeBytes),
    is_indexed: f.isIndexed,
    index_status: f.indexStatus,
    metadata: f.metadata ? JSON.parse(f.metadata) : null,
    url: f.storageKey.startsWith('https://') ? f.storageKey : `${baseUrl}/v1/files/${f.id}`,
    created_at: f.createdAt,
  }
}
