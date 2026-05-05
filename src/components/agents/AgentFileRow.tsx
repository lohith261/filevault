'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { formatBytes } from '@/lib/utils'
import type { AgentFileRecord } from '@/hooks/useAgentFiles'

interface AgentFileRowProps {
  file: AgentFileRecord
  onDelete: (id: string) => Promise<void>
  onIndex: (id: string) => Promise<{ chunks_created: number }>
}

const STATUS_LABELS: Record<string, { text: string; color: string }> = {
  not_indexed: { text: '—', color: 'text-[var(--muted-foreground)]' },
  pending: { text: 'Pending', color: 'text-[var(--warning)]' },
  indexing: { text: 'Indexing…', color: 'text-[var(--warning)]' },
  indexed: { text: 'Indexed', color: 'text-[var(--success)]' },
  failed: { text: 'Failed', color: 'text-[var(--destructive)]' },
}

function getFileIcon(mime: string) {
  if (mime.includes('pdf')) {
    return (
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    )
  }
  if (mime.includes('html')) {
    return (
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    )
  }
  if (mime.includes('json')) {
    return (
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    )
  }
  return (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
}

export function AgentFileRow({ file, onDelete, onIndex }: AgentFileRowProps) {
  const [indexing, setIndexing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [chunks, setChunks] = useState<number | null>(null)
  const [showMeta, setShowMeta] = useState(false)

  async function handleIndex() {
    setIndexing(true)
    try {
      const result = await onIndex(file.file_id)
      setChunks(result.chunks_created)
    } finally {
      setIndexing(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await onDelete(file.file_id)
    } catch {
      setDeleting(false)
    }
  }

  const status = STATUS_LABELS[file.index_status] ?? STATUS_LABELS.not_indexed

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: deleting ? 0.3 : 1 }}
      exit={{ opacity: 0 }}
      className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--muted)]/50 transition-colors"
    >
      {/* Icon */}
      <div className="text-[var(--muted-foreground)] shrink-0">
        {getFileIcon(file.mime_type)}
      </div>

      {/* Name + meta */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-[var(--foreground)]" title={file.name}>
          {file.name}
        </p>
        <p className="text-[11px] font-mono text-[var(--muted-foreground)]">
          {formatBytes(file.size_bytes)} · {file.mime_type.split('/')[1] ?? file.mime_type}
        </p>
      </div>

      {/* Status */}
      <div className="hidden sm:block shrink-0 w-24 text-right">
        <span className={`text-[11px] font-mono ${status.color}`}>
          {status.text}
          {chunks !== null ? ` · ${chunks}` : ''}
          {indexing && '…'}
        </span>
      </div>

      {/* Date */}
      <div className="hidden md:block shrink-0 w-28 text-right">
        <span className="text-[11px] font-mono text-[var(--muted-foreground)]">
          {new Date(file.created_at).toLocaleDateString()}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <a
          href={file.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] font-mono text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
        >
          Open
        </a>

        {file.index_status === 'not_indexed' && (
          <button
            onClick={handleIndex}
            disabled={indexing}
            className="text-[11px] font-mono text-[var(--brand)] hover:opacity-80 disabled:opacity-50 transition-opacity"
          >
            {indexing ? '…' : 'Index'}
          </button>
        )}

        {file.metadata && (
          <button
            onClick={() => setShowMeta(!showMeta)}
            className="text-[11px] font-mono text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            {showMeta ? 'Less' : 'Meta'}
          </button>
        )}

        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-[11px] font-mono text-[var(--muted-foreground)] hover:text-[var(--destructive)] disabled:opacity-50 transition-colors"
        >
          {deleting ? '…' : 'Delete'}
        </button>
      </div>

      {/* Metadata expand */}
      {showMeta && file.metadata && (
        <motion.pre
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="absolute left-0 right-0 top-full z-10 mx-4 mt-1 overflow-x-auto rounded-sm border border-[var(--border)] bg-[var(--card)] p-3 text-[10px] font-mono text-[var(--muted-foreground)]"
        >
          {JSON.stringify(file.metadata, null, 2)}
        </motion.pre>
      )}
    </motion.div>
  )
}
