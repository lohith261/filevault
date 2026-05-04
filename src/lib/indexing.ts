import { prisma } from '@/lib/prisma'
import { generateEmbedding } from '@/lib/embeddings'
import { chunkText } from '@/lib/chunking'
import { extractText } from '@/lib/extractors'
import { logger } from '@/lib/logger'

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
