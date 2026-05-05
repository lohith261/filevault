// Vector storage abstraction for dual-database support.
// SQLite stores vectors as JSON strings; Postgres uses pgvector native type.

export function isPostgres(): boolean {
  const url = process.env.DATABASE_URL ?? ''
  return url.startsWith('postgresql://') || url.startsWith('postgres://')
}

/**
 * Returns a Prisma-compatible vector payload.
 * For SQLite: `{ vector: JSON.stringify(arr) }`
 * For Postgres with prisma-extension-pgvector: `{ vector: arr }`
 */
export function toVector(arr: number[]): { vector: string } | { vector: number[] } {
  return isPostgres() ? { vector: arr } : { vector: JSON.stringify(arr) }
}

/**
 * Parses a raw vector from the database into a number array.
 * Handles JSON strings (SQLite) and native arrays (Postgres).
 */
export function fromVector(raw: unknown): number[] {
  if (typeof raw === 'string') return JSON.parse(raw)
  if (Array.isArray(raw)) return raw
  throw new Error('Invalid vector format')
}
