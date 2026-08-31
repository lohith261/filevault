'use client'

import useSWR from 'swr'
import { useCallback } from 'react'

export interface AgentFileRecord {
  file_id: string
  name: string
  mime_type: string
  size_bytes: number
  is_indexed: boolean
  index_status: 'not_indexed' | 'pending' | 'indexing' | 'indexed' | 'failed'
  metadata: Record<string, unknown> | null
  url: string
  created_at: string
}

function dashFetch(url: string) {
  return fetch(url, { credentials: 'include' }).then((r) => {
    if (!r.ok) throw new Error('Request failed')
    return r.json()
  })
}

export function useAgentFiles(agentId: string | null) {
  const base = agentId ? `/api/dashboard/agents/${agentId}` : null

  const { data, isLoading, error, mutate } = useSWR(
    base ? `${base}/files?limit=100` : null,
    dashFetch,
    { refreshInterval: 0 }
  )

  const deleteFile = useCallback(
    async (fileId: string) => {
      if (!base) return
      await mutate(
        async (current: { files: AgentFileRecord[] } | undefined) => {
          const res = await fetch(`${base}/files/${fileId}`, { method: 'DELETE', credentials: 'include' })
          if (!res.ok) throw new Error('Delete failed')
          if (!current) return current
          return { ...current, files: current.files.filter((f) => f.file_id !== fileId) }
        },
        { revalidate: true }
      )
    },
    [base, mutate]
  )

  const indexFile = useCallback(
    async (fileId: string): Promise<{ chunks_created?: number; status?: string }> => {
      if (!base) throw new Error('No agent selected')
      const res = await fetch(`${base}/files/${fileId}`, { method: 'POST', credentials: 'include' })
      if (!res.ok) throw new Error('Indexing failed')
      const result = await res.json()
      await mutate()
      return result
    },
    [base, mutate]
  )

  const uploadFile = useCallback(
    async (file: File, shouldIndex: boolean, metadata: Record<string, unknown> | null) => {
      if (!base) throw new Error('No agent selected')
      const form = new FormData()
      form.append('file', file)
      form.append('index', String(shouldIndex))
      if (metadata) form.append('metadata', JSON.stringify(metadata))

      const res = await fetch(`${base}/files`, { method: 'POST', credentials: 'include', body: form })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Upload failed')
      }
      await mutate()
      return res.json()
    },
    [base, mutate]
  )

  return {
    files: (data?.files ?? []) as AgentFileRecord[],
    isLoading,
    error,
    mutate,
    deleteFile,
    indexFile,
    uploadFile,
  }
}
