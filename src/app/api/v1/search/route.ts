import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { resolveAgent } from '@/lib/auth/apiKey'
import { generateEmbedding } from '@/lib/embeddings'
import { rankResults, type SearchResult } from '@/lib/search/similarity'

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
// Generates a query embedding and returns top-K results ranked by cosine similarity
// using pgvector's native <=> distance operator in raw SQL.
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
    const vectorLiteral = `[${queryVector.join(',')}]`
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

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? ''

    // --- FILE SEARCH via pgvector ---
    if (searchType === 'all' || searchType === 'files') {
      const fileIdFilter = filter?.file_id
      const agentIdList = Prisma.join(agentIds)
      const fileWhere = fileIdFilter
        ? Prisma.sql`AND e.file_id = ${fileIdFilter}`
        : collectionFileIds
          ? Prisma.sql`AND e.file_id IN (${Prisma.join(collectionFileIds)})`
          : Prisma.empty

      const rows = await prisma.$queryRaw(
        Prisma.sql`
          SELECT
            e.id,
            e.content,
            1 - (e.vector <=> ${vectorLiteral}::vector) AS score,
            e.file_id,
            f.name,
            f.storage_key,
            f.metadata
          FROM embeddings e
          JOIN agent_files f ON f.id = e.file_id
          WHERE e.agent_id IN (${agentIdList})
            AND f.index_status = 'indexed'
            ${fileWhere}
          ORDER BY e.vector <=> ${vectorLiteral}::vector
          LIMIT ${limit * 4}
        `
      ) as Array<{
        id: string
        content: string
        score: number
        file_id: string
        name: string | null
        storage_key: string | null
        metadata: string | null
      }>

      for (const row of rows) {
        // Apply metadata filter in-memory (metadata is JSON text)
        if (metadataFilter && row.metadata) {
          try {
            const fileMeta = JSON.parse(row.metadata) as Record<string, unknown>
            const matches = Object.entries(metadataFilter).every(([k, v]) => fileMeta[k] === v)
            if (!matches) continue
          } catch {
            continue
          }
        } else if (metadataFilter) {
          continue
        }

        const url = row.storage_key?.startsWith('https://')
          ? row.storage_key
          : `${baseUrl}/v1/files/${row.file_id}`

        results.push({
          id: row.id,
          type: 'file',
          content: row.content,
          score: row.score,
          fileId: row.file_id,
          fileUrl: url,
        })
      }
    }

    // --- MEMORY SEARCH via pgvector ---
    if (searchType === 'all' || searchType === 'memory') {
      const rows = await prisma.$queryRaw<
        Array<{
          id: string
          content: string
          score: number
        }>
      >`
        SELECT
          id,
          content,
          1 - (vector <=> ${vectorLiteral}::vector) AS score
        FROM memories
        WHERE agent_id = ${agentId}
          AND (expires_at IS NULL OR expires_at > NOW())
        ORDER BY vector <=> ${vectorLiteral}::vector
        LIMIT ${limit * 2}
      `

      for (const row of rows) {
        results.push({
          id: row.id,
          type: 'memory',
          content: row.content,
          score: row.score,
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
