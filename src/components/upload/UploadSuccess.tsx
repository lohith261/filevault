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

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="w-full space-y-6"
    >
      {/* Success indicator */}
      <div className="flex flex-col items-center gap-3 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15"
        >
          <svg className="h-7 w-7 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
      <div className="rounded-xl border border-[var(--border)] bg-[var(--muted)] p-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <a
            href={fullUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 truncate text-sm font-mono text-[var(--foreground)] hover:text-[var(--primary)] transition-colors"
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

      <Button variant="secondary" onClick={onReset} className="w-full">
        Upload another
      </Button>
    </motion.div>
  )
}
