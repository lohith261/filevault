import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    agentState: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
  },
}))

vi.mock('@/lib/auth/apiKey', () => ({
  resolveAgent: vi.fn(),
}))

vi.mock('@/lib/agentLimits', () => ({
  checkStateCapacity: vi.fn(),
}))

import { prisma } from '@/lib/prisma'
import { resolveAgent } from '@/lib/auth/apiKey'
import { checkStateCapacity } from '@/lib/agentLimits'
import { GET as getState, DELETE as deleteState } from '@/app/api/v1/state/[id]/route'
import { GET as listStates, POST as createState } from '@/app/api/v1/state/route'

const mockFindFirst = vi.mocked(prisma.agentState.findFirst)
const mockFindMany = vi.mocked(prisma.agentState.findMany)
const mockCreate = vi.mocked(prisma.agentState.create)
const mockUpdate = vi.mocked(prisma.agentState.update)
const mockDelete = vi.mocked(prisma.agentState.delete)
const mockCount = vi.mocked(prisma.agentState.count)
const mockResolveAgent = vi.mocked(resolveAgent)
const mockCheckStateCapacity = vi.mocked(checkStateCapacity)

function mockReq({ method = 'GET', body = null as unknown, search = '' } = {}) {
  return {
    method,
    headers: new Headers({ authorization: 'Bearer fv_sk_test' }),
    url: `http://localhost:3001/api/v1/state${search}`,
    json: async () => body,
  } as unknown as Request
}

beforeEach(() => {
  vi.clearAllMocks()
  mockResolveAgent.mockResolvedValue('agent1')
})

describe('POST /v1/state', () => {
  it('creates a new state when key does not exist', async () => {
    mockFindFirst.mockResolvedValue(null)
    mockCheckStateCapacity.mockResolvedValue({ allowed: true })
    mockCreate.mockResolvedValue({
      id: 's1',
      agentId: 'agent1',
      key: 'checkpoint-1',
      data: JSON.stringify({ foo: 'bar' }),
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    } as never)

    const req = mockReq({ method: 'POST', body: { key: 'checkpoint-1', data: { foo: 'bar' } } })
    const res = await createState(req as never)
    const json = await res.json()

    expect(res.status).toBe(201)
    expect(json.state_id).toBe('s1')
    expect(json.key).toBe('checkpoint-1')
    expect(mockCreate).toHaveBeenCalled()
  })

  it('updates existing state when key already exists', async () => {
    mockFindFirst.mockResolvedValue({
      id: 's1',
      agentId: 'agent1',
      key: 'checkpoint-1',
      data: JSON.stringify({ foo: 'old' }),
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    } as never)
    mockUpdate.mockResolvedValue({
      id: 's1',
      agentId: 'agent1',
      key: 'checkpoint-1',
      data: JSON.stringify({ foo: 'new' }),
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02'),
    } as never)

    const req = mockReq({ method: 'POST', body: { key: 'checkpoint-1', data: { foo: 'new' } } })
    const res = await createState(req as never)
    const json = await res.json()

    expect(res.status).toBe(201)
    expect(json.state_id).toBe('s1')
    expect(mockUpdate).toHaveBeenCalled()
    expect(mockCheckStateCapacity).not.toHaveBeenCalled()
  })

  it('returns 429 when at capacity', async () => {
    mockFindFirst.mockResolvedValue(null)
    mockCheckStateCapacity.mockResolvedValue({ allowed: false, reason: 'State limit reached.' })

    const req = mockReq({ method: 'POST', body: { key: 'checkpoint-1', data: { foo: 'bar' } } })
    const res = await createState(req as never)
    const json = await res.json()

    expect(res.status).toBe(429)
    expect(json.error).toBe('State limit reached.')
  })
})

describe('GET /v1/state', () => {
  it('lists states with pagination', async () => {
    mockFindMany.mockResolvedValue([
      { id: 's1', key: 'checkpoint-1', createdAt: new Date(), updatedAt: new Date() },
      { id: 's2', key: 'checkpoint-2', createdAt: new Date(), updatedAt: new Date() },
    ] as never)

    const req = mockReq({ search: '?limit=10' })
    const res = await listStates(req as never)
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.states).toHaveLength(2)
    expect(json.next_cursor).toBeNull()
  })

  it('filters by key', async () => {
    mockFindMany.mockResolvedValue([
      { id: 's1', key: 'checkpoint-1', createdAt: new Date(), updatedAt: new Date() },
    ] as never)

    const req = mockReq({ search: '?key=checkpoint' })
    const res = await listStates(req as never)

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ key: expect.any(Object) }),
      })
    )
    expect(res.status).toBe(200)
  })
})

describe('GET /v1/state/:id', () => {
  it('returns a single state', async () => {
    mockFindFirst.mockResolvedValue({
      id: 's1',
      agentId: 'agent1',
      key: 'checkpoint-1',
      data: JSON.stringify({ foo: 'bar' }),
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    } as never)

    const req = mockReq()
    const res = await getState(req as never, { params: Promise.resolve({ id: 's1' }) })
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.state_id).toBe('s1')
    expect(json.data).toEqual({ foo: 'bar' })
  })

  it('returns 404 when state not found', async () => {
    mockFindFirst.mockResolvedValue(null)

    const req = mockReq()
    const res = await getState(req as never, { params: Promise.resolve({ id: 's1' }) })

    expect(res.status).toBe(404)
  })

  it('returns 500 on corrupted JSON data', async () => {
    mockFindFirst.mockResolvedValue({
      id: 's1',
      agentId: 'agent1',
      key: 'checkpoint-1',
      data: 'not-json',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never)

    const req = mockReq()
    const res = await getState(req as never, { params: Promise.resolve({ id: 's1' }) })
    const json = await res.json()

    expect(res.status).toBe(500)
    expect(json.error).toBe('Corrupted state data.')
  })
})

describe('DELETE /v1/state/:id', () => {
  it('deletes an existing state', async () => {
    mockFindFirst.mockResolvedValue({ id: 's1' } as never)

    const req = mockReq()
    const res = await deleteState(req as never, { params: Promise.resolve({ id: 's1' }) })

    expect(res.status).toBe(204)
    expect(mockDelete).toHaveBeenCalledWith({ where: { id: 's1' } })
  })

  it('returns 404 when state not found', async () => {
    mockFindFirst.mockResolvedValue(null)

    const req = mockReq()
    const res = await deleteState(req as never, { params: Promise.resolve({ id: 's1' }) })

    expect(res.status).toBe(404)
  })
})
