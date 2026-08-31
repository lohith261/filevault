import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { resolveUserAgent } from '@/lib/auth/dashboardAgent'
import { generateEmbedding } from '@/lib/embeddings'
import { rankResults, type SearchResult } from '@/lib/search/similarity'

type Params = { params: Promise<{ id: string }> }

const SearchSchema = z.object({
  query: z.string().min(1).max(2000),
  filter: z.object({
    file_id: z.string().optional(),
    type: z.enum(['files', 'memory', 'all']).optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  }).optional(),
  limit: z.number().int().min(1).max(20).default(5),
})

// POST /api/dashboard/agents/[id]/search
export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params
  const agent = await resolveUserAgent(id)
  if (!agent) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })

  try {
    const body = await req.json()
    const parsed = SearchSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

    const { query, filter, limit } = parsed.data
    const searchType = filter?.type ?? 'all'
    const metadataFilter = filter?.metadata
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? ''
    const results: SearchResult[] = []

    const queryVector = await generateEmbedding(query)
    const vectorLiteral = `[${queryVector.join(',')}]`

    if (searchType === 'all' || searchType === 'files') {
      const fileIdFilter = filter?.file_id
      const fileWhere = fileIdFilter
        ? Prisma.sql`AND e."fileId" = ${fileIdFilter}`
        : Prisma.empty

      const rows = await prisma.$queryRaw(Prisma.sql`
        SELECT
          e.id, e.content,
          1 - (e.vector <=> ${vectorLiteral}::vector) AS score,
          e."fileId" AS file_id,
          f.name, f."storageKey" AS storage_key, f.metadata
        FROM embeddings e
        JOIN agent_files f ON f.id = e."fileId"
        WHERE e."agentId" = ${id}
          AND f."indexStatus" = 'indexed'
          ${fileWhere}
        ORDER BY e.vector <=> ${vectorLiteral}::vector
        LIMIT ${limit * 4}
      `) as Array<{ id: string; content: string; score: number; file_id: string; name: string | null; storage_key: string | null; metadata: string | null }>

      for (const row of rows) {
        if (metadataFilter && row.metadata) {
          try {
            const meta = JSON.parse(row.metadata) as Record<string, unknown>
            if (!Object.entries(metadataFilter).every(([k, v]) => meta[k] === v)) continue
          } catch { continue }
        } else if (metadataFilter) continue

        results.push({
          id: row.id, type: 'file', content: row.content, score: row.score,
          fileId: row.file_id,
          fileUrl: row.storage_key?.startsWith('https://') ? row.storage_key : `${baseUrl}/v1/files/${row.file_id}`,
        })
      }
    }

    if (searchType === 'all' || searchType === 'memory') {
      const rows = await prisma.$queryRaw<Array<{ id: string; content: string; score: number }>>`
        SELECT id, content, 1 - (vector <=> ${vectorLiteral}::vector) AS score
        FROM memories
        WHERE "agentId" = ${id} AND ("expiresAt" IS NULL OR "expiresAt" > NOW())
        ORDER BY vector <=> ${vectorLiteral}::vector
        LIMIT ${limit * 2}
      `
      for (const row of rows) {
        results.push({ id: row.id, type: 'memory', content: row.content, score: row.score })
      }
    }

    const ranked = rankResults(results, limit)
    return NextResponse.json({
      query,
      results: ranked.map((r) => ({
        id: r.id, type: r.type, content: r.content,
        score: parseFloat(r.score.toFixed(4)),
        ...(r.fileId ? { file_id: r.fileId } : {}),
        ...(r.fileUrl ? { url: r.fileUrl } : {}),
      })),
    })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Search failed.' }, { status: 500 })
  }
}
