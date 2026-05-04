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
    <div className="flex min-h-screen pt-14">
      {/* Sidebar */}
      <aside className="fixed left-0 top-14 bottom-0 w-56 border-r border-[var(--border)] bg-[var(--card)] flex flex-col">
        <div className="p-4 border-b border-[var(--border)]">
          <p className="text-xs font-medium text-[var(--foreground)] truncate">Agent</p>
          <p className="mt-0.5 font-mono text-[10px] text-[var(--muted-foreground)] truncate">{maskedKey}</p>
        </div>

        {/* Stats */}
        <div className="px-4 py-3 border-b border-[var(--border)] grid grid-cols-3 gap-2">
          {[
            { label: 'Files', value: files.length },
            { label: 'Indexed', value: indexedCount },
            { label: 'MB', value: Math.round(totalBytes / 1024 / 1024) },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-sm font-bold text-[var(--foreground)]">{s.value}</p>
              <p className="text-[10px] text-[var(--muted-foreground)]">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2">
          <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Storage</p>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors ${
                tab === item.id
                  ? 'bg-[var(--foreground)] text-[var(--primary-foreground)]'
                  : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-[var(--border)]">
          <button
            onClick={onForget}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-[var(--muted-foreground)] hover:text-[var(--destructive)] hover:bg-[var(--muted)] transition-colors"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Forget key
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-56 flex-1 p-8">
        <AnimatePresence mode="wait">
          {tab === 'files' && (
            <motion.div key="files" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-[var(--foreground)]">Files</h1>
                  <p className="text-sm text-[var(--muted-foreground)]">{files.length} total · {formatBytes(totalBytes)} used</p>
                </div>
                <Button onClick={() => setShowUpload(true)} size="sm" className="bg-[var(--foreground)] text-[var(--primary-foreground)] hover:bg-[var(--foreground)]/90">
                  <svg className="h-3.5 w-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Upload
                </Button>
              </div>

              <div className="mb-4">
                <Input
                  placeholder="Filter by name…"
                  value={fileSearch}
                  onChange={(e) => setFileSearch(e.target.value)}
                  className="w-full sm:w-72"
                />
              </div>

              {isLoading ? (
                <div className="flex justify-center py-20"><Spinner size="lg" /></div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border-2 border-dashed border-[var(--border)]">
                    <svg className="h-5 w-5 text-[var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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
              <div className="mb-6">
                <h1 className="text-xl font-bold text-[var(--foreground)]">Semantic Search</h1>
                <p className="text-sm text-[var(--muted-foreground)]">Search across all indexed files and memories</p>
              </div>
              <AgentSearch apiKey={apiKey} />
            </motion.div>
          )}

          {tab === 'memory' && (
            <motion.div key="memory" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="mb-6">
                <h1 className="text-xl font-bold text-[var(--foreground)]">Memory</h1>
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.97, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.97, opacity: 0 }}
        className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-semibold text-[var(--foreground)]">Upload file</h2>
          <button onClick={onClose} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* File picker */}
        <div
          onClick={() => inputRef.current?.click()}
          className="mb-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[var(--border)] bg-[var(--muted)] py-8 hover:border-[var(--foreground)]/30 transition-colors"
        >
          <svg className="mb-2 h-7 w-7 text-[var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            className={`relative h-5 w-9 rounded-full transition-colors ${shouldIndex ? 'bg-[var(--foreground)]' : 'bg-[var(--border)]'}`}
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
            className="w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--muted)] px-3 py-2 font-mono text-xs text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/20"
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
            className="flex-1 bg-[var(--foreground)] text-[var(--primary-foreground)] hover:bg-[var(--foreground)]/90"
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
