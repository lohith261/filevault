import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { resolveAgent } from '@/lib/auth/apiKey'
import { storageDriver } from '@/lib/storage'
import { getMimeType } from '@/lib/mime'
import { generateSlug } from '@/lib/slug'
import { indexFile } from '@/lib/indexing'
import { checkUploadRateLimit } from '@/lib/rateLimit'
import { fireWebhook } from '@/lib/webhook'
import { checkFileCapacity, checkEmbeddingCapacity } from '@/lib/agentLimits'

export const maxDuration = 60

// GET /v1/files?limit=20&cursor=<id>&indexed=true|false
export async function GET(req: NextRequest) {
  const agentId = await resolveAgent(req.headers.get('authorization'))
  if (!agentId) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const limit = Math.min(Math.max(parseInt(searchParams.get('limit') ?? '20', 10), 1), 100)
  const cursor = searchParams.get('cursor') ?? undefined
  const indexedParam = searchParams.get('indexed')

  const files = await prisma.agentFile.findMany({
    where: {
      agentId,
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

// POST /v1/files — multipart: file, metadata (JSON string), index (boolean string)
export async function POST(req: NextRequest) {
  const agentId = await resolveAgent(req.headers.get('authorization'))
  if (!agentId) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })

  const rateLimit = await checkUploadRateLimit(agentId)
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Try again in 60 seconds.' },
      {
        status: 429,
        headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) },
      }
    )
  }

  try {
    const form = await req.formData()
    const file = form.get('file') as File | null
    const shouldIndex = (form.get('index') as string)?.toLowerCase() === 'true'
    const metadataRaw = form.get('metadata') as string | null

    if (!file) return NextResponse.json({ error: 'No file provided.' }, { status: 400 })

    const fileCap = await checkFileCapacity(agentId)
    if (!fileCap.allowed) {
      return NextResponse.json({ error: fileCap.reason }, { status: 429 })
    }

    const MAX_FILE_SIZE = 50 * 1024 * 1024
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large. Maximum size is 50 MB.' }, { status: 413 })
    }

    let metadata: Record<string, unknown> | null = null
    if (metadataRaw) {
      try {
        metadata = JSON.parse(metadataRaw)
      } catch {
        return NextResponse.json({ error: 'metadata must be valid JSON.' }, { status: 400 })
      }
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const mimeType = getMimeType(file.name) || file.type || 'application/octet-stream'
    const slug = generateSlug()

    const prefix = await storageDriver.putFiles(`agents/${agentId}/${slug}`, [
      { path: file.name, buffer, mimeType, sizeBytes: file.size },
    ])
    const storageKey = `${prefix}/${file.name}`

    const agentFile = await prisma.agentFile.create({
      data: {
        agentId,
        name: file.name,
        mimeType,
        sizeBytes: BigInt(file.size),
        storageKey,
        metadata: metadata ? JSON.stringify(metadata) : null,
        isIndexed: false,
      },
    })

    let indexed = false
    if (shouldIndex) {
      const embCap = await checkEmbeddingCapacity(agentId)
      if (!embCap.allowed) {
        return NextResponse.json({ error: embCap.reason }, { status: 429 })
      }
      const result = await indexFile(agentId, agentFile.id, buffer, mimeType, file.name)
      indexed = result.indexed
      if (indexed) {
        await prisma.agentFile.update({ where: { id: agentFile.id }, data: { isIndexed: true } })
      }
    }

    fireWebhook(agentId, {
      event: 'file.created',
      data: { file_id: agentFile.id, name: file.name, size_bytes: file.size, is_indexed: indexed },
    })

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? ''
    return NextResponse.json(formatFile({ ...agentFile, isIndexed: indexed }, baseUrl), { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upload failed.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// Shared response shape for a file object.
function formatFile(
  f: {
    id: string
    name: string
    mimeType: string
    sizeBytes: bigint
    isIndexed: boolean
    metadata: string | null
    storageKey: string
    createdAt: Date
  },
  baseUrl: string
) {
  return {
    file_id: f.id,
    name: f.name,
    mime_type: f.mimeType,
    size_bytes: Number(f.sizeBytes),
    is_indexed: f.isIndexed,
    metadata: f.metadata ? JSON.parse(f.metadata) : null,
    url: f.storageKey.startsWith('https://') ? f.storageKey : `${baseUrl}/v1/files/${f.id}`,
    created_at: f.createdAt,
  }
}
