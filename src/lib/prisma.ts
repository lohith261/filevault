import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function createPrismaClient() {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL is not set')
  }

  const pool = new Pool({ connectionString: url })
  const adapter = new PrismaPg(pool)

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })
}

// Lazy proxy — defers client creation until first use so DATABASE_URL is not
// required at build time (Next.js imports modules during static page collection).
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_, prop) {
    const client = globalForPrisma.prisma ?? (globalForPrisma.prisma = createPrismaClient())
    return (client as unknown as Record<string | symbol, unknown>)[prop]
  },
})
