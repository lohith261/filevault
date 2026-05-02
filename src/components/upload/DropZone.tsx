'use client'

import { useCallback } from 'react'
import { useDropzone, type FileRejection } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface DropZoneProps {
  onFileSelected: (file: File) => void
  onReject?: (message: string) => void
  disabled?: boolean
  maxBytes?: number
}

export function DropZone({ onFileSelected, onReject, disabled, maxBytes = 100 * 1024 * 1024 }: DropZoneProps) {
  const onDrop = useCallback(
    (accepted: File[], rejectedFiles: FileRejection[]) => {
      if (rejectedFiles.length > 0) {
        onReject?.(rejectedFiles[0].errors[0]?.message ?? 'File not supported.')
        return
      }
      if (accepted[0]) {
        onFileSelected(accepted[0])
      }
    },
    [onFileSelected, onReject]
  )

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    maxSize: maxBytes,
    multiple: false,
    disabled,
  })

  return (
    <div
      {...getRootProps()}
      className={cn(
        'relative flex min-h-[200px] flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-200 cursor-pointer select-none outline-none',
        isDragActive && !isDragReject && 'border-[var(--primary)] bg-[var(--primary)]/5 scale-[1.01]',
        isDragReject && 'border-[var(--destructive)] bg-[var(--destructive)]/5',
        !isDragActive && 'border-[var(--border)] hover:border-[var(--muted-foreground)] hover:bg-[var(--muted)]/40',
        disabled && 'pointer-events-none opacity-50'
      )}
    >
      <input {...getInputProps()} />

      <AnimatePresence mode="wait">
        {isDragActive && !isDragReject ? (
          <motion.div
            key="dragging"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col items-center gap-3"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary)]/15">
              <svg className="h-7 w-7 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-base font-semibold text-[var(--primary)]">Drop to deploy</p>
          </motion.div>
        ) : isDragReject ? (
          <motion.div
            key="rejected"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col items-center gap-3"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--destructive)]/10">
              <svg className="h-7 w-7 text-[var(--destructive)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-sm font-medium text-[var(--destructive)]">File not supported</p>
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--muted)]">
              <svg className="h-8 w-8 text-[var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
              <motion.div
                animate={{ y: [-2, -5, -2] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -bottom-1.5"
              >
                <svg className="h-4 w-4 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </motion.div>
            </div>

            <div className="space-y-1.5">
              <p className="text-sm font-semibold text-[var(--foreground)]">
                Drag & drop your file here
              </p>
              <p className="text-xs text-[var(--muted-foreground)]">
                or <span className="text-[var(--foreground)] underline underline-offset-2">click to browse</span>
              </p>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap justify-center">
              <span className="rounded-md bg-[var(--muted)] px-2 py-0.5 font-mono text-xs font-medium text-[var(--foreground)]">.zip</span>
              <span className="rounded-md bg-[var(--muted)] px-2 py-0.5 font-mono text-xs font-medium text-[var(--foreground)]">.html</span>
              <span className="rounded-md bg-[var(--muted)] px-2 py-0.5 font-mono text-xs font-medium text-[var(--foreground)]">.pdf</span>
              <span className="rounded-md bg-[var(--muted)] px-2 py-0.5 font-mono text-xs font-medium text-[var(--foreground)]">.mp4</span>
              <span className="text-xs text-[var(--muted-foreground)]">+ any file type</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
