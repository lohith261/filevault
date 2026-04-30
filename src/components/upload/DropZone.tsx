'use client'

import { useCallback, useState } from 'react'
import { useDropzone, type FileRejection } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { cn, formatBytes } from '@/lib/utils'

interface DropZoneProps {
  onFileSelected: (file: File) => void
  disabled?: boolean
}

const ACCEPTED_TYPES = {
  'application/zip': ['.zip'],
  'application/x-zip-compressed': ['.zip'],
  'text/html': ['.html', '.htm'],
  'text/css': ['.css'],
  'application/javascript': ['.js'],
  'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico'],
}

export function DropZone({ onFileSelected, disabled }: DropZoneProps) {
  const [selected, setSelected] = useState<File | null>(null)
  const [rejected, setRejected] = useState<string | null>(null)

  const onDrop = useCallback(
    (accepted: File[], rejectedFiles: FileRejection[]) => {
      if (rejectedFiles.length > 0) {
        setRejected(rejectedFiles[0].errors[0]?.message ?? 'File not supported.')
        return
      }
      if (accepted[0]) {
        setSelected(accepted[0])
        setRejected(null)
        onFileSelected(accepted[0])
      }
    },
    [onFileSelected]
  )

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: 50 * 1024 * 1024,
    multiple: false,
    disabled,
  })

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={cn(
          'relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-200 cursor-pointer select-none',
          isDragActive && !isDragReject && 'border-[var(--primary)] bg-[var(--primary)]/5 scale-[1.01]',
          isDragReject && 'border-[var(--destructive)] bg-[var(--destructive)]/5',
          !isDragActive && !selected && 'border-[var(--border)] hover:border-[var(--muted-foreground)] hover:bg-[var(--muted)]/50',
          selected && !isDragActive && 'border-emerald-500/50 bg-emerald-500/5',
          disabled && 'pointer-events-none opacity-50'
        )}
      >
        <input {...getInputProps()} />

        <AnimatePresence mode="wait">
          {isDragActive ? (
            <motion.div
              key="dragging"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary)]/15">
                <svg className="h-7 w-7 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className="text-lg font-semibold text-[var(--primary)]">Drop it here!</p>
            </motion.div>
          ) : selected ? (
            <motion.div
              key="selected"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15">
                <svg className="h-7 w-7 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-[var(--foreground)]">{selected.name}</p>
                <p className="text-sm text-[var(--muted-foreground)]">{formatBytes(selected.size)}</p>
              </div>
              <p className="text-xs text-[var(--muted-foreground)]">Click to change file</p>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--muted)]">
                <svg className="h-8 w-8 text-[var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div className="space-y-1">
                <p className="text-base font-semibold text-[var(--foreground)]">
                  Drop your files here
                </p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  ZIP, HTML, CSS, JS, images · up to 50MB
                </p>
              </div>
              <p className="text-xs text-[var(--muted-foreground)]">or click to browse</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {rejected && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-sm text-[var(--destructive)] text-center"
        >
          {rejected}
        </motion.p>
      )}
    </div>
  )
}
