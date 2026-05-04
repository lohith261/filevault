import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    agentFile: {
      count: vi.fn(),
      aggregate: vi.fn(),
    },
    embedding: { count: vi.fn() },
    memory: { count: vi.fn() },
  },
}))

import { prisma } from '@/lib/prisma'
import { checkFileCapacity, checkEmbeddingCapacity, checkMemoryCapacity } from '@/lib/agentLimits'

const mockFileCount = vi.mocked(prisma.agentFile.count)
const mockFileAgg = vi.mocked(prisma.agentFile.aggregate)
const mockEmbCount = vi.mocked(prisma.embedding.count)
const mockMemCount = vi.mocked(prisma.memory.count)

beforeEach(() => vi.clearAllMocks())

describe('checkFileCapacity', () => {
  it('allows when under both caps', async () => {
    mockFileCount.mockResolvedValue(0)
    mockFileAgg.mockResolvedValue({ _sum: { sizeBytes: BigInt(0) } } as never)
    expect((await checkFileCapacity('a')).allowed).toBe(true)
  })

  it('blocks when file count hits 1000', async () => {
    mockFileCount.mockResolvedValue(1000)
    mockFileAgg.mockResolvedValue({ _sum: { sizeBytes: BigInt(0) } } as never)
    const result = await checkFileCapacity('a')
    expect(result.allowed).toBe(false)
    expect(result.reason).toMatch(/1,?000/)
  })

  it('blocks when storage hits 1 GB', async () => {
    mockFileCount.mockResolvedValue(0)
    mockFileAgg.mockResolvedValue({ _sum: { sizeBytes: BigInt(1024 * 1024 * 1024) } } as never)
    const result = await checkFileCapacity('a')
    expect(result.allowed).toBe(false)
    expect(result.reason).toMatch(/1 GB/)
  })
})

describe('checkEmbeddingCapacity', () => {
  it('allows when under cap', async () => {
    mockEmbCount.mockResolvedValue(100)
    expect((await checkEmbeddingCapacity('a')).allowed).toBe(true)
  })

  it('blocks at 50000', async () => {
    mockEmbCount.mockResolvedValue(50000)
    const result = await checkEmbeddingCapacity('a')
    expect(result.allowed).toBe(false)
    expect(result.reason).toMatch(/50,?000/)
  })
})

describe('checkMemoryCapacity', () => {
  it('allows when under cap', async () => {
    mockMemCount.mockResolvedValue(0)
    expect((await checkMemoryCapacity('a')).allowed).toBe(true)
  })

  it('blocks at 5000', async () => {
    mockMemCount.mockResolvedValue(5000)
    const result = await checkMemoryCapacity('a')
    expect(result.allowed).toBe(false)
    expect(result.reason).toMatch(/5,?000/)
  })
})
