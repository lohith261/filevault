'use client'

import { useState } from 'react'
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

const NAV_ITEMS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  {
    id: 'files',
    label: 'Files',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    id: 'search',
    label: 'Search',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    id: 'memory',
    label: 'Memory',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
]

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
    <div className="flex min-h-screen pt-16 bg-[var(--background)]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-16 bottom-0 w-60 border-r border-[var(--border)] bg-[var(--card)]/50 backdrop-blur-sm flex flex-col z-30">
        {/* Agent identity */}
        <div className="p-4 border-b border-[var(--border)]">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-1">
            Active Agent
          </p>
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-[var(--brand)] to-[var(--brand-secondary)]">
              <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 001.591 2.25L21 14.5m-9 0l3.75 4.5M12 3.104v.082m0 0a24.301 24.301 0 00-4.5 0" />
              </svg>
            </div>
            <p className="font-mono text-[11px] text-[var(--muted-foreground)] truncate">{maskedKey}</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3">
          <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
            Workspace
          </p>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-all ${
                tab === item.id
                  ? 'bg-[var(--brand-muted)] text-[var(--brand)] shadow-sm'
                  : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* Footer actions */}
        <div className="p-3 border-t border-[var(--border)]">
          <button
            onClick={onForget}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-[var(--muted-foreground)] hover:text-[var(--destructive)] hover:bg-[var(--destructive)]/5 transition-colors"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Switch agent
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-60 flex-1 min-w-0">
        <AnimatePresence mode="wait">
          {tab === 'files' && (
            <motion.div
              key="files"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-6 lg:p-8"
            >
              {/* Stats row */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                  {
                    label: 'Files',
                    value: files.length,
                    icon: (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    ),
                  },
                  {
                    label: 'Indexed',
                    value: indexedCount,
                    icon: (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                      </svg>
                    ),
                  },
                  {
                    label: 'Storage used',
                    value: formatBytes(totalBytes),
                    icon: (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    ),
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4"
                  >
                    <div className="flex items-center gap-2 text-[var(--muted-foreground)] mb-2">
                      {stat.icon}
                      <span className="text-xs font-medium uppercase tracking-wider">{stat.label}</span>
                    </div>
                    <p className="text-2xl font-bold text-[var(--foreground)]">{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Header */}
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-[var(--foreground)] tracking-tight">Files</h1>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {files.length} total · {formatBytes(totalBytes)} used
                  </p>
                </div>
                <Button
                  onClick={() => setShowUpload(true)}
                  size="sm"
                  className="bg-[var(--brand)] text-[var(--brand-foreground)] hover:opacity-90 shadow-md shadow-[var(--brand-glow)]"
                >
                  <svg className="h-3.5 w-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Upload file
                </Button>
              </div>

              {/* Filter */}
              <div className="mb-4">
                <Input
                  placeholder="Filter by name…"
                  value={fileSearch}
                  onChange={(e) => setFileSearch(e.target.value)}
                  className="w-full sm:w-80"
                />
              </div>

              {/* File grid */}
              {isLoading ? (
                <div className="flex justify-center py-20">
                  <Spinner size="lg" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)]/50">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border-2 border-dashed border-[var(--border)] bg-[var(--muted)]">
                    <svg className="h-5 w-5 text-[var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="font-medium text-[var(--foreground)]">No files yet</p>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">Upload a file to get started.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
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
            <motion.div
              key="search"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-6 lg:p-8"
            >
              <div className="mb-6">
                <h1 className="text-xl font-bold text-[var(--foreground)] tracking-tight">Semantic Search</h1>
                <p className="text-sm text-[var(--muted-foreground)]">Search across all indexed files and memories</p>
              </div>
              <AgentSearch apiKey={apiKey} />
            </motion.div>
          )}

          {tab === 'memory' && (
            <motion.div
              key="memory"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-6 lg:p-8"
            >
              <div className="mb-6">
                <h1 className="text-xl font-bold text-[var(--foreground)] tracking-tight">Memory</h1>
                <p className="text-sm text-[var(--muted-foreground)]">Persistent key-value facts for your agent</p>
              </div>
              <AgentMemory apiKey={apiKey} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Upload modal */}
      <AnimatePresence>
        {showUpload && (
          <UploadModal onClose={() => setShowUpload(false)} onUpload={uploadFile} />
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.97, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.97, opacity: 0 }}
        className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-semibold text-[var(--foreground)]">Upload file</h2>
          <button
            onClick={onClose}
            className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors rounded-lg p-1 hover:bg-[var(--muted)]"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Dropzone */}
        <label className="mb-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[var(--border)] bg-[var(--muted)] py-10 hover:border-[var(--brand)]/30 hover:bg-[var(--brand-muted)]/30 transition-all">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--brand-muted)] text-[var(--brand)] mb-3">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <p className="text-sm font-medium text-[var(--foreground)]">
            {file ? file.name : 'Click to select a file'}
          </p>
          {file && <p className="text-xs text-[var(--muted-foreground)] mt-1">{formatBytes(file.size)}</p>}
          <input
            type="file"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>

        {/* Index toggle */}
        <label className="mb-4 flex cursor-pointer items-center gap-3">
          <div
            onClick={() => setShouldIndex(!shouldIndex)}
            className={`relative h-5 w-9 rounded-full transition-colors ${
              shouldIndex ? 'bg-[var(--brand)]' : 'bg-[var(--border)]'
            }`}
          >
            <div
              className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                shouldIndex ? 'translate-x-4' : 'translate-x-0.5'
              }`}
            />
          </div>
          <span className="text-sm text-[var(--foreground)]">Index for semantic search</span>
        </label>

        {/* Metadata */}
        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-medium text-[var(--muted-foreground)]">
            Metadata (optional JSON)
          </label>
          <textarea
            className="w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--muted)] px-3 py-2 font-mono text-xs text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20 focus:border-[var(--brand)]/30 transition-all"
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
          <Button
            className="flex-1 bg-[var(--brand)] text-[var(--brand-foreground)] hover:opacity-90"
            onClick={handleUpload}
            disabled={!file || uploading}
          >
            {uploading ? <Spinner size="sm" /> : 'Upload'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}
