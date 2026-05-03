'use client'

import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { FileCard } from './FileCard'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import type { SiteRecord } from '@/hooks/useFiles'

interface FileGridProps {
  sites: SiteRecord[]
  isLoading: boolean
  onDelete: (slug: string) => void
  onRename: (slug: string, label: string) => void
  onUpdate: (slug: string, file: File) => Promise<void>
  onSetDomain: (slug: string, domain: string | null) => Promise<void>
  isPro: boolean
}

export function FileGrid({ sites, isLoading, onDelete, onRename, onUpdate, onSetDomain, isPro }: FileGridProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size="lg" />
      </div>
    )
  }

  if (sites.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-24 text-center"
      >
        {/* Stacked card illustration */}
        <div className="relative mb-6 h-24 w-24">
          <div className="absolute inset-0 rounded-2xl border-2 border-dashed border-[var(--border)] bg-[var(--muted)] rotate-6 opacity-40" />
          <div className="absolute inset-0 rounded-2xl border-2 border-dashed border-[var(--border)] bg-[var(--muted)] rotate-3 opacity-60" />
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl border-2 border-dashed border-[var(--border)] bg-[var(--card)]">
            <svg className="h-8 w-8 text-[var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
        </div>
        <h3 className="text-lg font-semibold text-[var(--foreground)]">No deployments yet</h3>
        <p className="mt-2 max-w-xs text-sm text-[var(--muted-foreground)]">
          Upload a ZIP or HTML file from the home page and it will appear here.
        </p>
        <Link href="/" className="mt-6">
          <Button>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Upload your first file
          </Button>
        </Link>
      </motion.div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <AnimatePresence mode="popLayout">
        {sites.map((site) => (
          <FileCard key={site.slug} site={site} onDelete={onDelete} onRename={onRename} onUpdate={onUpdate} onSetDomain={onSetDomain} isPro={isPro} />
        ))}
      </AnimatePresence>
    </div>
  )
}
