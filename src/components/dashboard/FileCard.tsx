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
import { DropZone } from '@/components/upload/DropZone'
import { getLimits, getTier } from '@/lib/limits'
import type { SiteRecord } from '@/hooks/useFiles'

interface FileCardProps {
  site: SiteRecord
  onDelete: (slug: string) => void
  onRename: (slug: string, label: string) => void
  onUpdate: (slug: string, file: File) => Promise<void>
  onSetDomain: (slug: string, domain: string | null) => Promise<void>
  isPro: boolean
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

export function FileCard({ site, onDelete, onRename, onUpdate, onSetDomain, isPro }: FileCardProps) {
  const [showDelete, setShowDelete] = useState(false)
  const [showRename, setShowRename] = useState(false)
  const [showUpdate, setShowUpdate] = useState(false)
  const [showDomain, setShowDomain] = useState(false)
  const [renameLabel, setRenameLabel] = useState(site.label || site.slug)
  const [domainValue, setDomainValue] = useState(site.customDomain ?? '')
  const [deleting, setDeleting] = useState(false)
  const [renaming, setRenaming] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [savingDomain, setSavingDomain] = useState(false)
  const [updateError, setUpdateError] = useState<string | null>(null)
  const [domainError, setDomainError] = useState<string | null>(null)

  const limits = getLimits(getTier('signed-in', false))

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

  const handleUpdate = async (file: File) => {
    setUpdating(true)
    setUpdateError(null)
    try {
      await onUpdate(site.slug, file)
      setShowUpdate(false)
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : 'Update failed.')
    } finally {
      setUpdating(false)
    }
  }

  const handleSaveDomain = async () => {
    setSavingDomain(true)
    setDomainError(null)
    try {
      await onSetDomain(site.slug, domainValue.trim() || null)
      setShowDomain(false)
    } catch (err) {
      setDomainError(err instanceof Error ? err.message : 'Failed to save domain.')
    } finally {
      setSavingDomain(false)
    }
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
          <Button variant="ghost" size="sm" onClick={() => { setShowUpdate(true); setUpdateError(null) }} title="Update files">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShowRename(true)}>
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setShowDomain(true); setDomainError(null); setDomainValue(site.customDomain ?? '') }}
            title={isPro ? 'Custom domain' : 'Custom domain (Pro)'}
            className={site.customDomain ? 'text-[var(--primary)]' : ''}
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
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

      {/* Custom domain dialog */}
      <Dialog open={showDomain} onClose={() => setShowDomain(false)} title="Custom domain">
        {isPro ? (
          <>
            <p className="mb-4 text-sm text-[var(--muted-foreground)]">
              Point your domain to <code className="rounded bg-[var(--muted)] px-1 py-0.5 text-xs">filevault.host</code> with a CNAME record, then enter it below.
            </p>
            <div className="mb-4 rounded-lg border border-[var(--border)] bg-[var(--muted)] px-4 py-3 text-xs font-mono">
              <p className="mb-1 text-[var(--muted-foreground)]">DNS record to add:</p>
              <p><span className="text-[var(--foreground)]">Type:</span> CNAME</p>
              <p><span className="text-[var(--foreground)]">Name:</span> @ (or your subdomain)</p>
              <p><span className="text-[var(--foreground)]">Value:</span> filevault.host</p>
            </div>
            <Input
              label="Your domain"
              value={domainValue}
              onChange={(e) => setDomainValue(e.target.value)}
              placeholder="mysite.com"
              className="mb-2"
            />
            {domainError && (
              <p className="mb-4 text-sm text-[var(--destructive)]">{domainError}</p>
            )}
            <div className="flex justify-between gap-3 mt-4">
              {site.customDomain && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setDomainValue(''); handleSaveDomain() }}
                  className="text-[var(--destructive)]"
                >
                  Remove
                </Button>
              )}
              <div className="ml-auto flex gap-3">
                <Button variant="secondary" onClick={() => setShowDomain(false)}>Cancel</Button>
                <Button onClick={handleSaveDomain} loading={savingDomain}>Save</Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <p className="mb-6 text-sm text-[var(--muted-foreground)]">
              Custom domains are available on the <strong className="text-[var(--foreground)]">Pro plan</strong>.
              Point any domain to your FileVault site without changing the URL.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowDomain(false)}>Close</Button>
              <Button onClick={() => { setShowDomain(false); window.location.href = '/pricing' }}>Upgrade to Pro</Button>
            </div>
          </>
        )}
      </Dialog>

      {/* Update dialog */}
      <Dialog
        open={showUpdate}
        onClose={() => { if (!updating) setShowUpdate(false) }}
        title="Update deployment"
      >
        <p className="mb-4 text-sm text-[var(--muted-foreground)]">
          Drop a new file to replace <strong className="text-[var(--foreground)]">{displayName}</strong>.
          The URL stays the same — only the files change.
        </p>
        {updating ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--primary)]" />
            <p className="text-sm text-[var(--muted-foreground)]">Updating…</p>
          </div>
        ) : (
          <DropZone
            onFileSelected={handleUpdate}
            onReject={(msg) => setUpdateError(msg)}
            disabled={false}
            maxBytes={limits.maxBytes}
          />
        )}
        {updateError && (
          <p className="mt-2 text-center text-sm text-[var(--destructive)]">{updateError}</p>
        )}
        {!updating && (
          <div className="mt-4 flex justify-end">
            <Button variant="secondary" size="sm" onClick={() => setShowUpdate(false)}>Cancel</Button>
          </div>
        )}
      </Dialog>
    </>
  )
}
