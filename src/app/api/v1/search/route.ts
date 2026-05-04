import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { resolveAgent } from '@/lib/auth/apiKey'
import { generateEmbedding } from '@/lib/embeddings'
import { cosineSimilarity, rankResults, type SearchResult } from '@/lib/search/similarity'

const SearchSchema = z.object({
  query: z.string().min(1).max(2000),
  filter: z
    .object({
      file_id: z.string().optional(),
      type: z.enum(['files', 'memory', 'all']).optional(),
      metadata: z.record(z.string(), z.unknown()).optional(),
      collection_id: z.string().optional(),
      include_shared: z.boolean().optional(),
    })
    .optional(),
  limit: z.number().int().min(1).max(20).default(5),
})

// POST /v1/search
// Generates a query embedding and returns top-K results ranked by cosine similarity.
// Searches both file embeddings and memory for the agent.
export async function POST(req: NextRequest) {
  const agentId = await resolveAgent(req.headers.get('authorization'))
  if (!agentId) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const parsed = SearchSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const { query, filter, limit } = parsed.data
    const searchType = filter?.type ?? 'all'
    const metadataFilter = filter?.metadata
    const collectionId = filter?.collection_id
    const includeShared = filter?.include_shared ?? false

    const queryVector = await generateEmbedding(query)
    const results: SearchResult[] = []

    // Resolve which agentIds to search across (own + optionally shared-from agents)
    const agentIds: string[] = [agentId]
    if (includeShared && (searchType === 'all' || searchType === 'files')) {
      const shares = await prisma.agentShare.findMany({
        where: { granteeAgentId: agentId },
        select: { ownerAgentId: true },
      })
      agentIds.push(...shares.map((s) => s.ownerAgentId))
    }

    // Resolve file IDs if filtering by collection
    let collectionFileIds: string[] | null = null
    if (collectionId) {
      const cf = await prisma.collectionFile.findMany({
        where: { collectionId, collection: { agentId } },
        select: { fileId: true },
      })
      collectionFileIds = cf.map((r) => r.fileId)
    }

    // Search file embeddings
    if (searchType === 'all' || searchType === 'files') {
      const where: Record<string, unknown> = {
        agentId: agentIds.length === 1 ? agentId : { in: agentIds },
        ...(filter?.file_id ? { fileId: filter.file_id } : {}),
        ...(collectionFileIds ? { fileId: { in: collectionFileIds } } : {}),
      }

      const rows = await prisma.embedding.findMany({
        where,
        select: {
          id: true,
          content: true,
          vector: true,
          fileId: true,
          agentId: true,
          file: { select: { name: true, storageKey: true, metadata: true } },
        },
      })

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? ''
      for (const row of rows) {
        // Apply metadata filter in-memory
        if (metadataFilter && row.file?.metadata) {
          try {
            const fileMeta = JSON.parse(row.file.metadata) as Record<string, unknown>
            const matches = Object.entries(metadataFilter).every(([k, v]) => fileMeta[k] === v)
            if (!matches) continue
          } catch {
            continue
          }
        } else if (metadataFilter) {
          continue
        }

        const vec = JSON.parse(row.vector) as number[]
        const score = cosineSimilarity(queryVector, vec)
        const url = row.file?.storageKey.startsWith('https://')
          ? row.file.storageKey
          : row.fileId
          ? `${baseUrl}/v1/files/${row.fileId}`
          : undefined
        results.push({
          id: row.id,
          type: 'file',
          content: row.content,
          score,
          fileId: row.fileId ?? undefined,
          fileUrl: url,
        })
      }
    }

    // Search memories
    if (searchType === 'all' || searchType === 'memory') {
      const memories = await prisma.memory.findMany({
        where: {
          agentId,
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
        select: { id: true, content: true, vector: true },
      })

      for (const mem of memories) {
        const vec = JSON.parse(mem.vector) as number[]
        results.push({
          id: mem.id,
          type: 'memory',
          content: mem.content,
          score: cosineSimilarity(queryVector, vec),
        })
      }
    }

    const ranked = rankResults(results, limit)

    return NextResponse.json({
      query,
      results: ranked.map((r) => ({
        id: r.id,
        type: r.type,
        content: r.content,
        score: parseFloat(r.score.toFixed(4)),
        ...(r.fileId ? { file_id: r.fileId } : {}),
        ...(r.fileUrl ? { url: r.fileUrl } : {}),
      })),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Search failed.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
