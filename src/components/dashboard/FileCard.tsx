'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { CopyButton } from '@/components/shared/CopyButton'
import { QRCodeDisplay } from '@/components/shared/QRCodeDisplay'
import { Dialog } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { formatBytes, formatRelativeTime } from '@/lib/utils'
import type { SiteRecord } from '@/hooks/useFiles'

interface FileCardProps {
  site: SiteRecord
  onDelete: (slug: string) => void
  onRename: (slug: string, label: string) => void
}

function getExpiryStatus(expiresAt: string | null): {
  badge: 'success' | 'warning' | 'destructive' | 'outline'
  label: string
} {
  if (!expiresAt) return { badge: 'outline', label: 'Permanent' }
  const diff = new Date(expiresAt).getTime() - Date.now()
  if (diff < 0) return { badge: 'destructive', label: 'Expired' }
  if (diff < 24 * 60 * 60 * 1000) return { badge: 'warning', label: `Expires ${formatRelativeTime(expiresAt)}` }
  return { badge: 'success', label: `Expires ${formatRelativeTime(expiresAt)}` }
}

export function FileCard({ site, onDelete, onRename }: FileCardProps) {
  const [showDelete, setShowDelete] = useState(false)
  const [showRename, setShowRename] = useState(false)
  const [renameLabel, setRenameLabel] = useState(site.label || site.slug)
  const [deleting, setDeleting] = useState(false)
  const [renaming, setRenaming] = useState(false)

  const expiry = getExpiryStatus(site.expiresAt)
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const fullUrl = `${baseUrl}/s/${site.slug}`
  const displayName = site.label || site.slug

  const handleDelete = async () => {
    setDeleting(true)
    await onDelete(site.slug)
    setShowDelete(false)
    setDeleting(false)
  }

  const handleRename = async () => {
    setRenaming(true)
    await onRename(site.slug, renameLabel)
    setShowRename(false)
    setRenaming(false)
  }

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="group rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 hover:border-[var(--muted-foreground)] transition-all hover:shadow-lg hover:shadow-black/5 hover:-translate-y-0.5"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-[var(--foreground)] truncate" title={displayName}>
              {displayName}
            </h3>
            <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
              {new Date(site.createdAt).toLocaleDateString()}
            </p>
          </div>
          <Badge variant={expiry.badge}>{expiry.label}</Badge>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-[var(--muted-foreground)] mb-4">
          <span className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {site.viewCount.toLocaleString()} views
          </span>
          <span className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582 4-8 4" />
            </svg>
            {formatBytes(Number(site.totalSizeBytes))}
          </span>
          {site.passwordHash && (
            <span className="flex items-center gap-1">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Protected
            </span>
          )}
        </div>

        {/* URL row */}
        <div className="flex items-center gap-1.5 rounded-lg bg-[var(--muted)] px-3 py-2 mb-4">
          <span className="flex-1 truncate text-xs font-mono text-[var(--muted-foreground)]">
            /s/{site.slug}
          </span>
          <CopyButton text={fullUrl} iconOnly />
          <QRCodeDisplay url={fullUrl} />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <a href={fullUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Visit
            </Button>
          </a>
          <Button variant="ghost" size="sm" onClick={() => setShowRename(true)}>
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShowDelete(true)} className="text-[var(--destructive)] hover:bg-[var(--destructive)]/10">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </Button>
        </div>
      </motion.div>

      {/* Delete dialog */}
      <Dialog open={showDelete} onClose={() => setShowDelete(false)} title="Delete site">
        <p className="text-sm text-[var(--muted-foreground)] mb-6">
          Are you sure you want to delete <strong className="text-[var(--foreground)]">{displayName}</strong>?
          This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setShowDelete(false)}>Cancel</Button>
          <Button variant="destructive" onClick={handleDelete} loading={deleting}>Delete</Button>
        </div>
      </Dialog>

      {/* Rename dialog */}
      <Dialog open={showRename} onClose={() => setShowRename(false)} title="Rename site">
        <Input
          label="Display name"
          value={renameLabel}
          onChange={(e) => setRenameLabel(e.target.value)}
          placeholder={site.slug}
          className="mb-6"
        />
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setShowRename(false)}>Cancel</Button>
          <Button onClick={handleRename} loading={renaming}>Save</Button>
        </div>
      </Dialog>
    </>
  )
}
