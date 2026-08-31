'use client'

import useSWR from 'swr'
import { useCallback } from 'react'

export interface MemoryRecord {
  memory_id: string
  content: string
  expires_at: string | null
  created_at: string
}

function dashFetch(url: string) {
  return fetch(url, { credentials: 'include' }).then((r) => {
    if (!r.ok) throw new Error('Request failed')
    return r.json()
  })
}

export function useAgentMemory(agentId: string | null) {
  const base = agentId ? `/api/dashboard/agents/${agentId}` : null

  const { data, isLoading, mutate } = useSWR(
    base ? `${base}/memory?limit=50` : null,
    dashFetch,
    { refreshInterval: 0 }
  )

  const addMemory = useCallback(
    async (content: string, ttl?: number) => {
      if (!base) throw new Error('No agent selected')
      const res = await fetch(`${base}/memory`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, ...(ttl ? { ttl } : {}) }),
      })
      if (!res.ok) throw new Error('Failed to store memory')
      await mutate()
      return res.json()
    },
    [base, mutate]
  )

  return {
    memories: (data?.memories ?? []) as MemoryRecord[],
    isLoading,
    mutate,
    addMemory,
  }
}
