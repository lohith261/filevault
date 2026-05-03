import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { resolveAgent } from '@/lib/auth/apiKey'
import { storageDriver } from '@/lib/storage'
import { getMimeType } from '@/lib/mime'
import { generateEmbedding } from '@/lib/embeddings'
import { chunkText } from '@/lib/chunking'
import { extractText } from '@/lib/extractors'
import { generateSlug } from '@/lib/slug'

export const maxDuration = 60

// POST /v1/files
// Accepts multipart/form-data: file, metadata (JSON string), index (boolean).
export async function POST(req: NextRequest) {
  const agentId = await resolveAgent(req.headers.get('authorization'))
  if (!agentId) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  try {
    const form = await req.formData()
    const file = form.get('file') as File | null
    const shouldIndex = (form.get('index') as string)?.toLowerCase() === 'true'
    const metadataRaw = form.get('metadata') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 })
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

    // Store as a single-file "prefix" under agents/{agentId}/{slug}/{filename}
    const storageKey = await storageDriver
      .putFiles(`agents/${agentId}/${slug}`, [
        { path: file.name, buffer, mimeType, sizeBytes: file.size },
      ])
      .then((prefix) => `${prefix}/${file.name}`)

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
      indexed = await indexFile(agentId, agentFile.id, buffer, mimeType, file.name)
      if (indexed) {
        await prisma.agentFile.update({
          where: { id: agentFile.id },
          data: { isIndexed: true },
        })
      }
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? ''
    return NextResponse.json(
      {
        file_id: agentFile.id,
        name: file.name,
        url: storageKey.startsWith('https://') ? storageKey : `${baseUrl}/v1/files/${agentFile.id}`,
        mime_type: mimeType,
        size_bytes: file.size,
        indexed,
        created_at: agentFile.createdAt,
      },
      { status: 201 }
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upload failed.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// Extract text → chunk → embed → store in embeddings table.
// Returns true if at least one embedding was stored.
async function indexFile(
  agentId: string,
  fileId: string,
  buffer: Buffer,
  mimeType: string,
  filename: string
): Promise<boolean> {
  const text = await extractText(buffer, mimeType, filename)
  if (!text) return false

  const chunks = chunkText(text)
  if (chunks.length === 0) return false

  await Promise.all(
    chunks.map(async (chunk) => {
      const vector = await generateEmbedding(chunk)
      await prisma.embedding.create({
        data: {
          agentId,
          fileId,
          content: chunk,
          vector: JSON.stringify(vector),
        },
      })
    })
  )

  return true
}
