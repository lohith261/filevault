import { prisma } from '@/lib/prisma'
import { generateEmbedding } from '@/lib/embeddings'
import { chunkText } from '@/lib/chunking'
import { extractText } from '@/lib/extractors'
import { logger } from '@/lib/logger'
import { checkEmbeddingCapacity } from '@/lib/agentLimits'
import { fireWebhook } from '@/lib/webhook'

export interface IndexResult {
  indexed: boolean
  chunksCreated: number
}

// Extract text → chunk → embed → store embeddings for a file.
export async function indexFile(
  agentId: string,
  fileId: string,
  buffer: Buffer,
  mimeType: string,
  filename: string
): Promise<IndexResult> {
  const text = await extractText(buffer, mimeType, filename)
  if (!text) return { indexed: false, chunksCreated: 0 }

  const chunks = chunkText(text)
  if (chunks.length === 0) return { indexed: false, chunksCreated: 0 }

  await Promise.all(
    chunks.map(async (chunk) => {
      const vector = await generateEmbedding(chunk)
      await prisma.embedding.create({
        data: { agentId, fileId, content: chunk, vector: JSON.stringify(vector) },
      })
    })
  )

  logger.info('file indexed', { agentId, fileId, chunks: chunks.length })
  return { indexed: true, chunksCreated: chunks.length }
}

// Background indexing job with status management and webhook firing.
// Call this from after() or a queue worker — NOT from the request path.
export async function runIndexingJob(
  agentId: string,
  fileId: string,
  buffer: Buffer,
  mimeType: string,
  filename: string
): Promise<void> {
  try {
    // Capacity check
    const cap = await checkEmbeddingCapacity(agentId)
    if (!cap.allowed) {
      await prisma.agentFile.update({
        where: { id: fileId },
        data: { indexStatus: 'failed' },
      })
      logger.warn('indexing job blocked: capacity', { agentId, fileId, reason: cap.reason })
      return
    }

    // Mark as indexing
    await prisma.agentFile.update({
      where: { id: fileId },
      data: { indexStatus: 'indexing' },
    })

    // Run indexing
    const result = await indexFile(agentId, fileId, buffer, mimeType, filename)

    if (result.indexed) {
      await prisma.agentFile.update({
        where: { id: fileId },
        data: { indexStatus: 'indexed', isIndexed: true },
      })
      fireWebhook(agentId, {
        event: 'file.indexed',
        data: { file_id: fileId, chunks_created: result.chunksCreated },
      })
    } else {
      await prisma.agentFile.update({
        where: { id: fileId },
        data: { indexStatus: 'failed' },
      })
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    await prisma.agentFile.update({
      where: { id: fileId },
      data: { indexStatus: 'failed' },
    })
    logger.error('indexing job failed', { agentId, fileId, error: message })
  }
}

// Convert a Web ReadableStream to a Buffer.
export async function streamToBuffer(stream: ReadableStream): Promise<Buffer> {
  const reader = stream.getReader()
  const chunks: Uint8Array[] = []
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
  }
  return Buffer.concat(chunks)
}
