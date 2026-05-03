'use client'

import { useState, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { formatBytes } from '@/lib/utils'
import { useAgentFiles } from '@/hooks/useAgentFiles'
import { AgentFileCard } from './AgentFileCard'
import { AgentSearch } from './AgentSearch'
import { AgentMemory } from './AgentMemory'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'

type Tab = 'files' | 'search' | 'memory'

interface AgentDashboardProps {
  apiKey: string
  onForget: () => void
}

export function AgentDashboard({ apiKey, onForget }: AgentDashboardProps) {
  const [tab, setTab] = useState<Tab>('files')
  const [fileSearch, setFileSearch] = useState('')
  const [showUpload, setShowUpload] = useState(false)

  const { files, isLoading, deleteFile, indexFile, uploadFile } = useAgentFiles(apiKey)

  const maskedKey = `fv_sk_…${apiKey.slice(-6)}`

  const filtered = fileSearch
    ? files.filter((f) => f.name.toLowerCase().includes(fileSearch.toLowerCase()))
    : files

  const indexedCount = files.filter((f) => f.is_indexed).length
  const totalBytes = files.reduce((s, f) => s + f.size_bytes, 0)

  return (
    <div className="mx-auto max-w-5xl px-4 pt-24 pb-16">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Agent Dashboard</h1>
          <p className="mt-0.5 font-mono text-xs text-[var(--muted-foreground)]">{maskedKey}</p>
        </div>
        <button
          onClick={onForget}
          className="text-xs text-[var(--muted-foreground)] hover:text-[var(--destructive)] transition-colors"
        >
          Forget key
        </button>
      </div>

      {/* Stats */}
      <div className="mb-6 flex flex-wrap gap-6 border-b border-[var(--border)] pb-6">
        {[
          { label: 'Total files', value: files.length.toLocaleString() },
          { label: 'Indexed', value: indexedCount.toLocaleString() },
          { label: 'Storage', value: formatBytes(totalBytes) },
        ].map((stat) => (
          <div key={stat.label}>
            <p className="text-2xl font-bold text-[var(--foreground)]">{stat.value}</p>
            <p className="text-xs text-[var(--muted-foreground)]">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 border-b border-[var(--border)]">
        {(['files', 'search', 'memory'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`relative px-4 py-2 text-sm font-medium capitalize transition-colors ${
              tab === t
                ? 'text-[var(--foreground)]'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            }`}
          >
            {t}
            {tab === t && (
              <motion.div
                layoutId="tab-underline"
                className="absolute inset-x-0 -bottom-px h-0.5 bg-[var(--primary)]"
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        {tab === 'files' && (
          <motion.div key="files" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <Input
                placeholder="Filter by name…"
                value={fileSearch}
                onChange={(e) => setFileSearch(e.target.value)}
                className="w-full sm:w-64"
              />
              <Button onClick={() => setShowUpload(true)}>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Upload file
              </Button>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-16"><Spinner size="lg" /></div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-dashed border-[var(--border)]">
                  <svg className="h-6 w-6 text-[var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <p className="font-medium text-[var(--foreground)]">No files yet</p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">Upload a file to get started.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence mode="popLayout">
                  {filtered.map((file) => (
                    <AgentFileCard
                      key={file.file_id}
                      file={file}
                      onDelete={deleteFile}
                      onIndex={indexFile}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}

        {tab === 'search' && (
          <motion.div key="search" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <AgentSearch apiKey={apiKey} />
          </motion.div>
        )}

        {tab === 'memory' && (
          <motion.div key="memory" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <AgentMemory apiKey={apiKey} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload modal */}
      <AnimatePresence>
        {showUpload && (
          <UploadModal
            onClose={() => setShowUpload(false)}
            onUpload={uploadFile}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Upload Modal ──────────────────────────────────────────────────────────────

interface UploadModalProps {
  onClose: () => void
  onUpload: (file: File, index: boolean, metadata: Record<string, unknown> | null) => Promise<unknown>
}

function UploadModal({ onClose, onUpload }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [shouldIndex, setShouldIndex] = useState(true)
  const [metaRaw, setMetaRaw] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function parseMetadata(): Record<string, unknown> | null {
    if (!metaRaw.trim()) return null
    try {
      return JSON.parse(metaRaw)
    } catch {
      return null
    }
  }

  async function handleUpload() {
    if (!file) return
    const meta = metaRaw.trim() ? parseMetadata() : null
    if (metaRaw.trim() && !meta) {
      setError('Metadata must be valid JSON')
      return
    }
    setUploading(true)
    setError('')
    try {
      await onUpload(file, shouldIndex, meta)
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed')
      setUploading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-base font-semibold text-[var(--foreground)]">Upload file</h2>

        {/* File picker */}
        <div
          onClick={() => inputRef.current?.click()}
          className="mb-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[var(--border)] bg-[var(--muted)] py-8 hover:border-[var(--primary)]/50 transition-colors"
        >
          <svg className="mb-2 h-8 w-8 text-[var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-sm text-[var(--foreground)]">
            {file ? file.name : 'Click to select a file'}
          </p>
          {file && (
            <p className="text-xs text-[var(--muted-foreground)]">{formatBytes(file.size)}</p>
          )}
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>

        {/* Index toggle */}
        <label className="mb-4 flex cursor-pointer items-center gap-3">
          <div
            onClick={() => setShouldIndex(!shouldIndex)}
            className={`relative h-5 w-9 rounded-full transition-colors ${shouldIndex ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'}`}
          >
            <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${shouldIndex ? 'translate-x-4' : 'translate-x-0.5'}`} />
          </div>
          <span className="text-sm text-[var(--foreground)]">Index for semantic search</span>
        </label>

        {/* Metadata */}
        <div className="mb-4">
          <label className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">
            Metadata (optional JSON)
          </label>
          <textarea
            className="w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--muted)] px-3 py-2 font-mono text-xs text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
            rows={3}
            placeholder='{"project": "q3", "author": "alice"}'
            value={metaRaw}
            onChange={(e) => setMetaRaw(e.target.value)}
          />
        </div>

        {error && <p className="mb-3 text-xs text-[var(--destructive)]">{error}</p>}

        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={onClose} disabled={uploading}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleUpload} disabled={!file || uploading}>
            {uploading ? <Spinner size="sm" /> : 'Upload'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}
