'use client'

import useSWR from 'swr'
import { useCallback } from 'react'

export interface AgentFileRecord {
  file_id: string
  name: string
  mime_type: string
  size_bytes: number
  is_indexed: boolean
  metadata: Record<string, unknown> | null
  url: string
  created_at: string
}

function agentFetch(url: string, key: string) {
  return fetch(url, { headers: { Authorization: `Bearer ${key}` } }).then((r) => {
    if (!r.ok) throw new Error('Request failed')
    return r.json()
  })
}

export function useAgentFiles(apiKey: string | null) {
  const { data, isLoading, error, mutate } = useSWR(
    apiKey ? ['/api/v1/files?limit=100', apiKey] : null,
    ([url, key]: [string, string]) => agentFetch(url, key),
    { refreshInterval: 0 }
  )

  const deleteFile = useCallback(
    async (fileId: string) => {
      if (!apiKey) return
      await mutate(
        async (current: { files: AgentFileRecord[] } | undefined) => {
          const res = await fetch(`/api/v1/files/${fileId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${apiKey}` },
          })
          if (!res.ok) throw new Error('Delete failed')
          if (!current) return current
          return { ...current, files: current.files.filter((f) => f.file_id !== fileId) }
        },
        { revalidate: true }
      )
    },
    [apiKey, mutate]
  )

  const indexFile = useCallback(
    async (fileId: string): Promise<{ chunks_created: number }> => {
      if (!apiKey) throw new Error('No API key')
      const res = await fetch(`/api/v1/files/${fileId}/index`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}` },
      })
      if (!res.ok) throw new Error('Indexing failed')
      const result = await res.json()
      await mutate()
      return result
    },
    [apiKey, mutate]
  )

  const uploadFile = useCallback(
    async (file: File, shouldIndex: boolean, metadata: Record<string, unknown> | null) => {
      if (!apiKey) throw new Error('No API key')
      const form = new FormData()
      form.append('file', file)
      form.append('index', String(shouldIndex))
      if (metadata) form.append('metadata', JSON.stringify(metadata))

      const res = await fetch('/api/v1/files', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}` },
        body: form,
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Upload failed')
      }
      await mutate()
      return res.json()
    },
    [apiKey, mutate]
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
