import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { resolveAgent } from '@/lib/auth/apiKey'
import { storageDriver } from '@/lib/storage'
import { getMimeType } from '@/lib/mime'
import { generateSlug } from '@/lib/slug'
import { indexFile } from '@/lib/indexing'
import { checkUploadRateLimit } from '@/lib/rateLimit'
import { fireWebhook } from '@/lib/webhook'

export const maxDuration = 120

// POST /v1/files/batch — upload up to 10 files in one request
// Form fields: files[] (multiple), index (boolean string), metadata (JSON string, shared)
export async function POST(req: NextRequest) {
  const agentId = await resolveAgent(req.headers.get('authorization'))
  if (!agentId) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })

  const rateLimit = await checkUploadRateLimit(agentId)
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Try again in 60 seconds.' },
      { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) } }
    )
  }

  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid multipart form.' }, { status: 400 })
  }

  const rawFiles = form.getAll('files') as File[]
  if (!rawFiles.length) return NextResponse.json({ error: 'No files provided.' }, { status: 400 })
  if (rawFiles.length > 10) return NextResponse.json({ error: 'Maximum 10 files per batch.' }, { status: 400 })

  const shouldIndex = (form.get('index') as string)?.toLowerCase() === 'true'
  const metadataRaw = form.get('metadata') as string | null
  let metadata: Record<string, unknown> | null = null
  if (metadataRaw) {
    try {
      metadata = JSON.parse(metadataRaw)
    } catch {
      return NextResponse.json({ error: 'metadata must be valid JSON.' }, { status: 400 })
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? ''
  const results: { file_id: string; name: string; size_bytes: number; is_indexed: boolean; url: string; error?: string }[] = []

  const MAX_FILE_SIZE = 50 * 1024 * 1024

  for (const file of rawFiles) {
    try {
      if (file.size > MAX_FILE_SIZE) {
        results.push({ file_id: '', name: file.name, size_bytes: file.size, is_indexed: false, url: '', error: 'File too large. Maximum size is 50 MB.' })
        continue
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
        const result = await indexFile(agentId, agentFile.id, buffer, mimeType, file.name)
        indexed = result.indexed
        if (indexed) await prisma.agentFile.update({ where: { id: agentFile.id }, data: { isIndexed: true } })
      }

      fireWebhook(agentId, {
        event: 'file.created',
        data: { file_id: agentFile.id, name: file.name, size_bytes: file.size, is_indexed: indexed },
      })

      results.push({
        file_id: agentFile.id,
        name: file.name,
        size_bytes: file.size,
        is_indexed: indexed,
        url: storageKey.startsWith('https://') ? storageKey : `${baseUrl}/v1/files/${agentFile.id}`,
      })
    } catch (err) {
      results.push({ file_id: '', name: file.name, size_bytes: 0, is_indexed: false, url: '', error: err instanceof Error ? err.message : 'Upload failed.' })
    }
  }

  const status = results.every((r) => r.error) ? 500 : results.some((r) => r.error) ? 207 : 201
  return NextResponse.json({ files: results }, { status })
}
