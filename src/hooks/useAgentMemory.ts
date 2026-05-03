'use client'

import useSWR from 'swr'
import { useCallback } from 'react'

export interface MemoryRecord {
  memory_id: string
  content: string
  expires_at: string | null
  created_at: string
}

function agentFetch(url: string, key: string) {
  return fetch(url, { headers: { Authorization: `Bearer ${key}` } }).then((r) => {
    if (!r.ok) throw new Error('Request failed')
    return r.json()
  })
}

export function useAgentMemory(apiKey: string | null) {
  const { data, isLoading, mutate } = useSWR(
    apiKey ? ['/api/v1/memory?limit=50', apiKey] : null,
    ([url, key]: [string, string]) => agentFetch(url, key),
    { refreshInterval: 0 }
  )

  const addMemory = useCallback(
    async (content: string, ttl?: number) => {
      if (!apiKey) throw new Error('No API key')
      const res = await fetch('/api/v1/memory', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, ...(ttl ? { ttl } : {}) }),
      })
      if (!res.ok) throw new Error('Failed to store memory')
      await mutate()
      return res.json()
    },
    [apiKey, mutate]
  )

  return {
    memories: (data?.memories ?? []) as MemoryRecord[],
    isLoading,
    mutate,
    addMemory,
  }
}
