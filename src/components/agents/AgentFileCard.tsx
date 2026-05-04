'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { formatBytes } from '@/lib/utils'
import type { AgentFileRecord } from '@/hooks/useAgentFiles'

interface AgentFileCardProps {
  file: AgentFileRecord
  onDelete: (id: string) => Promise<void>
  onIndex: (id: string) => Promise<{ chunks_created: number }>
}

export function AgentFileCard({ file, onDelete, onIndex }: AgentFileCardProps) {
  const [indexing, setIndexing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [chunks, setChunks] = useState<number | null>(null)
  const [isIndexed, setIsIndexed] = useState(file.is_indexed)
  const [showMeta, setShowMeta] = useState(false)

  async function handleIndex() {
    setIndexing(true)
    try {
      const result = await onIndex(file.file_id)
      setChunks(result.chunks_created)
      setIsIndexed(true)
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

  const ext = file.name.split('.').pop()?.toUpperCase() ?? 'FILE'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: deleting ? 0.4 : 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group relative rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 transition-colors hover:border-[var(--foreground)]/20"
    >
      {/* Header */}
      <div className="mb-3 flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--muted)] text-[10px] font-bold text-[var(--muted-foreground)]">
          {ext.slice(0, 4)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-[var(--foreground)]" title={file.name}>
            {file.name}
          </p>
          <p className="text-xs text-[var(--muted-foreground)]">
            {formatBytes(file.size_bytes)} · {new Date(file.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Badges */}
      <div className="mb-3 flex flex-wrap gap-1.5">
        {isIndexed ? (
          <span className="inline-flex items-center gap-1 rounded-md bg-[var(--success)]/10 px-2 py-0.5 text-[11px] font-medium text-[var(--success)]">
            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
            </svg>
            Indexed{chunks !== null ? ` · ${chunks} chunks` : ''}
          </span>
        ) : (
          <span className="inline-flex rounded-md bg-[var(--muted)] px-2 py-0.5 text-[11px] font-medium text-[var(--muted-foreground)]">
            Not indexed
          </span>
        )}
        <span className="inline-flex rounded-md bg-[var(--muted)] px-2 py-0.5 text-[11px] font-medium text-[var(--muted-foreground)]">
          {file.mime_type.split('/')[1] ?? file.mime_type}
        </span>
      </div>

      {/* Metadata toggle */}
      {file.metadata && (
        <button
          onClick={() => setShowMeta(!showMeta)}
          className="mb-2 text-xs text-[var(--primary)] hover:underline"
        >
          {showMeta ? 'Hide metadata' : 'Show metadata'}
        </button>
      )}
      {showMeta && file.metadata && (
        <pre className="mb-3 overflow-x-auto rounded-lg bg-[var(--muted)] p-2 text-[10px] text-[var(--muted-foreground)]">
          {JSON.stringify(file.metadata, null, 2)}
        </pre>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        <a
          href={file.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-7 items-center gap-1 rounded-lg px-2.5 text-xs font-medium text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
        >
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Open
        </a>

        {!isIndexed && (
          <button
            onClick={handleIndex}
            disabled={indexing}
            className="flex h-7 items-center gap-1 rounded-lg px-2.5 text-xs font-medium text-[var(--primary)] hover:bg-[var(--primary)]/10 disabled:opacity-50 transition-colors"
          >
            {indexing ? (
              <>
                <svg className="h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Indexing…
              </>
            ) : (
              <>
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Index
              </>
            )}
          </button>
        )}

        <button
          onClick={handleDelete}
          disabled={deleting}
          className="ml-auto flex h-7 items-center gap-1 rounded-lg px-2.5 text-xs font-medium text-[var(--muted-foreground)] hover:bg-[var(--destructive)]/10 hover:text-[var(--destructive)] disabled:opacity-50 transition-colors"
        >
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          {deleting ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </motion.div>
  )
}
