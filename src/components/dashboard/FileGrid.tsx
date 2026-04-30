'use client'

import { AnimatePresence } from 'framer-motion'
import { FileCard } from './FileCard'
import { Spinner } from '@/components/ui/Spinner'
import type { SiteRecord } from '@/hooks/useFiles'

interface FileGridProps {
  sites: SiteRecord[]
  isLoading: boolean
  onDelete: (slug: string) => void
  onRename: (slug: string, label: string) => void
}

export function FileGrid({ sites, isLoading, onDelete, onRename }: FileGridProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size="lg" />
      </div>
    )
  }

  if (sites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--muted)] mb-4">
          <svg className="h-8 w-8 text-[var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-[var(--foreground)]">No deployments yet</h3>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Upload your first file to get started.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <AnimatePresence mode="popLayout">
        {sites.map((site) => (
          <FileCard key={site.slug} site={site} onDelete={onDelete} onRename={onRename} />
        ))}
      </AnimatePresence>
    </div>
  )
}
