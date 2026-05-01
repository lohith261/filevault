'use client'

import { motion } from 'framer-motion'
import { CopyButton } from '@/components/shared/CopyButton'
import { QRCodeDisplay } from '@/components/shared/QRCodeDisplay'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import type { UploadResult } from '@/hooks/useUpload'
import { formatBytes, formatRelativeTime } from '@/lib/utils'

interface UploadSuccessProps {
  result: UploadResult
  onReset: () => void
}

export function UploadSuccess({ result, onReset }: UploadSuccessProps) {
  const fullUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/s/${result.slug}`
    : result.url

  const tweetUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent('Check out my site hosted on FileVault 🚀')}`
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(fullUrl)}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="w-full space-y-5"
    >
      {/* Success indicator */}
      <div className="flex flex-col items-center gap-3 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.1 }}
          className="relative flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15"
        >
          <motion.div
            animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 rounded-full bg-emerald-500/20"
          />
          <svg className="relative h-9 w-9 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>
        <div>
          <h3 className="text-xl font-bold text-[var(--foreground)]">Your site is live!</h3>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            {result.fileCount} {result.fileCount === 1 ? 'file' : 'files'} · {formatBytes(result.totalSizeBytes)}
            {result.expiresAt && ` · Expires ${formatRelativeTime(result.expiresAt)}`}
          </p>
        </div>
      </div>

      {/* URL display */}
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
          Your site is live at
        </p>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 shrink-0 rounded-full bg-emerald-500 animate-pulse" />
          <a
            href={fullUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 truncate text-sm font-mono font-medium text-[var(--foreground)] hover:text-[var(--primary)] transition-colors"
          >
            {fullUrl}
          </a>
          <CopyButton text={fullUrl} />
          <QRCodeDisplay url={fullUrl} />
          <a
            href={fullUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg p-2 text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)] transition-colors"
            title="Open in new tab"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>

      {/* Full-width copy button */}
      <button
        onClick={() => navigator.clipboard.writeText(fullUrl)}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--muted)]"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
        </svg>
        Copy link
      </button>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 justify-center">
        <Badge variant="success">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Live
        </Badge>
        {result.expiresAt ? (
          <Badge variant="warning">Expires {formatRelativeTime(result.expiresAt)}</Badge>
        ) : (
          <Badge variant="outline">Permanent</Badge>
        )}
      </div>

      {/* Share row */}
      <div className="border-t border-[var(--border)] pt-4">
        <p className="mb-3 text-center text-xs font-medium text-[var(--muted-foreground)]">Share</p>
        <div className="flex items-center justify-center gap-3">
          <a
            href={tweetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--muted-foreground)] transition-colors hover:border-[var(--foreground)] hover:text-[var(--foreground)]"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Share on X
          </a>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--muted-foreground)] transition-colors hover:border-[var(--foreground)] hover:text-[var(--foreground)]"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            WhatsApp
          </a>
        </div>
      </div>

      <Button variant="secondary" onClick={onReset} className="w-full">
        Upload another
      </Button>
    </motion.div>
  )
}
