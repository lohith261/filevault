'use client'

import { motion } from 'framer-motion'

interface UploadProgressProps {
  progress: number
  stage: 'uploading' | 'processing'
  filename?: string
}

export function UploadProgress({ progress, stage, filename }: UploadProgressProps) {
  return (
    <div className="w-full space-y-5 py-2">
      {/* Icon */}
      <div className="flex justify-center">
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--muted)]">
          <svg className="h-7 w-7 text-[var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
          </svg>
          {stage === 'processing' && (
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-0 rounded-2xl bg-[var(--primary)]/15"
            />
          )}
        </div>
      </div>

      {/* Filename + percentage */}
      <div className="text-center">
        {filename && (
          <p className="truncate font-mono text-sm font-medium text-[var(--foreground)]">{filename}</p>
        )}
        {stage === 'uploading' ? (
          <p className="mt-1 text-3xl font-bold tabular-nums text-[var(--foreground)]">{progress}%</p>
        ) : (
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">Deploying…</p>
        )}
        <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
          {stage === 'uploading' ? 'Uploading…' : 'Extracting & building your site…'}
        </p>
      </div>

      {/* Progress bar */}
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-[var(--primary)]"
          initial={{ width: 0 }}
          animate={{ width: stage === 'processing' ? '92%' : `${progress}%` }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        />
        {stage === 'processing' && (
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          />
        )}
      </div>
    </div>
  )
}
