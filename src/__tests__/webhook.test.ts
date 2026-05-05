import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    agent: {
      findUnique: vi.fn(),
    },
  },
}))

import { prisma } from '@/lib/prisma'
import { fireWebhook, isPrivateUrl } from '@/lib/webhook'

const mockFindUnique = vi.mocked(prisma.agent.findUnique)

describe('fireWebhook — SSRF protection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn().mockResolvedValue({ ok: true })
  })

  const cases: [string, string][] = [
    ['localhost', 'http://localhost/hook'],
    ['127.x loopback', 'http://127.0.0.1/hook'],
    ['10.x private', 'http://10.0.0.1/hook'],
    ['172.16–31 private', 'http://172.16.0.1/hook'],
    ['192.168 private', 'http://192.168.1.1/hook'],
    ['link-local', 'http://169.254.169.254/hook'],
  ]

  for (const [label, url] of cases) {
    it(`blocks ${label}`, async () => {
      mockFindUnique.mockResolvedValue({ webhookUrl: url } as never)
      await fireWebhook('agent1', { event: 'file.deleted', data: { file_id: 'f1' } })
      expect(global.fetch).not.toHaveBeenCalled()
    })
  }

  it('allows a public URL', async () => {
    mockFindUnique.mockResolvedValue({ webhookUrl: 'https://example.com/hook' } as never)
    await fireWebhook('agent1', { event: 'file.deleted', data: { file_id: 'f1' } })
    expect(global.fetch).toHaveBeenCalledOnce()
  })

  it('does nothing when agent has no webhook', async () => {
    mockFindUnique.mockResolvedValue({ webhookUrl: null } as never)
    await fireWebhook('agent1', { event: 'file.deleted', data: { file_id: 'f1' } })
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('does not throw if fetch fails', async () => {
    mockFindUnique.mockResolvedValue({ webhookUrl: 'https://example.com/hook' } as never)
    global.fetch = vi.fn().mockRejectedValue(new Error('network error'))
    await expect(
      fireWebhook('agent1', { event: 'file.deleted', data: { file_id: 'f1' } })
    ).resolves.toBeUndefined()
  })
})

describe('isPrivateUrl', () => {
  it('blocks localhost', () => {
    expect(isPrivateUrl('http://localhost/hook')).toBe(true)
  })

  it('blocks 127.0.0.1', () => {
    expect(isPrivateUrl('http://127.0.0.1/hook')).toBe(true)
  })

  it('blocks 169.254.169.254', () => {
    expect(isPrivateUrl('http://169.254.169.254/latest/meta-data/')).toBe(true)
  })

  it('allows public URLs', () => {
    expect(isPrivateUrl('https://example.com/hook')).toBe(false)
  })
})
