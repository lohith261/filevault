#!/usr/bin/env npx tsx
/**
 * Schema-drift guard.
 *
 * Every raw SQL query in this codebase (indexing.ts, /v1/search, /v1/memory)
 * bypasses Prisma's typed API to touch the `vector` columns, which means
 * TypeScript cannot catch a column-name mismatch between the SQL and the
 * actual database. That gap is exactly what broke indexing, search, and
 * memory storage in production for months (see commit fixing that).
 *
 * This script is the structural fix for the *class* of bug, not just the
 * one instance: it connects to the database this run is targeting and
 * asserts that every column each raw-SQL block references actually exists.
 * Run it in CI right after migrations, before anything else -- it's meant
 * to fail fast and loud, with a message that says exactly which table/column
 * is missing, rather than a generic Prisma "column does not exist" buried
 * in an indexing job's silently-caught error.
 *
 * Usage: DATABASE_URL=... npx tsx scripts/check-schema.ts
 */
import { Client } from 'pg'

// Table -> columns actually referenced by raw SQL in the app. Update this
// alongside any change to a $queryRaw/$executeRaw block that touches these
// tables (search route, memory route, indexing.ts).
const EXPECTED: Record<string, string[]> = {
  embeddings: ['id', 'agentId', 'fileId', 'content', 'vector', 'createdAt'],
  memories: ['id', 'agentId', 'content', 'vector', 'expiresAt', 'createdAt'],
  agent_files: ['id', 'agentId', 'name', 'storageKey', 'indexStatus', 'metadata'],
}

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) {
    console.error('DATABASE_URL is not set.')
    process.exit(1)
  }

  const client = new Client({ connectionString: url })
  await client.connect()

  let ok = true
  for (const [table, columns] of Object.entries(EXPECTED)) {
    const { rows } = await client.query(
      `SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1`,
      [table]
    )
    const actual = new Set(rows.map((r) => r.column_name))
    const missing = columns.filter((c) => !actual.has(c))
    if (missing.length > 0) {
      ok = false
      console.error(
        `[schema-check] FAIL: table "${table}" is missing column(s) the application's raw SQL expects: ${missing.join(', ')}`
      )
      console.error(`[schema-check]   actual columns: ${[...actual].sort().join(', ')}`)
    } else {
      console.log(`[schema-check] OK: "${table}" has all ${columns.length} expected columns`)
    }
  }

  await client.end()

  if (!ok) {
    console.error(
      '\n[schema-check] One or more tables are missing columns that raw SQL in this codebase depends on.\n' +
      '[schema-check] Either the migration is out of date, or the raw SQL was written against the wrong column names.\n' +
      '[schema-check] Fix before merging -- this is the exact bug class that broke indexing/search/memory in production.'
    )
    process.exit(1)
  }

  console.log('\n[schema-check] All raw-SQL-referenced columns are present.')
}

main().catch((err) => {
  console.error('[schema-check] Error running schema check:', err)
  process.exit(1)
})
