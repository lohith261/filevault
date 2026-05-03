'use client'

import useSWR from 'swr'
import { useCallback } from 'react'

export interface SiteRecord {
  id: string
  slug: string
  label: string
  userId: string | null
  expiresAt: string | null
  createdAt: string
  totalSizeBytes: string
  entryFile: string
  viewCount: number
  passwordHash: string | null
  customDomain: string | null
}

interface FilesResponse {
  sites: SiteRecord[]
  total: number
  page: number
  pageSize: number
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useFiles(page = 1, search = '') {
  const params = new URLSearchParams({ page: String(page) })
  if (search) params.set('search', search)

  const { data, error, isLoading, mutate } = useSWR<FilesResponse>(
    `/api/files?${params}`,
    fetcher,
    { refreshInterval: 30_000 }
  )

  const deleteFile = useCallback(
    async (slug: string) => {
      await mutate(
        async (current) => {
          await fetch(`/api/files/${slug}`, { method: 'DELETE' })
          if (!current) return current
          return {
            ...current,
            sites: current.sites.filter((s) => s.slug !== slug),
            total: current.total - 1,
          }
        },
        { revalidate: true }
      )
    },
    [mutate]
  )

  const renameFile = useCallback(
    async (slug: string, label: string) => {
      await fetch(`/api/files/${slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label }),
      })
      await mutate()
    },
    [mutate]
  )

  const updateFile = useCallback(
    async (slug: string, file: File): Promise<void> => {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch(`/api/files/${slug}`, { method: 'PUT', body: formData })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Update failed.')
      }
      await mutate()
    },
    [mutate]
  )

  const setCustomDomain = useCallback(
    async (slug: string, customDomain: string | null): Promise<void> => {
      const res = await fetch(`/api/files/${slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customDomain }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to update domain.')
      }
      await mutate()
    },
    [mutate]
  )

  return {
    sites: data?.sites ?? [],
    total: data?.total ?? 0,
    isLoading,
    error,
    mutate,
    deleteFile,
    renameFile,
    updateFile,
    setCustomDomain,
  }
}
