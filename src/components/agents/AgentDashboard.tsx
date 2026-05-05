'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { formatBytes } from '@/lib/utils'
import { useAgentFiles } from '@/hooks/useAgentFiles'
import { AgentFileRow } from './AgentFileRow'
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

const NAV_ITEMS: { id: Tab; label: string }[] = [
  { id: 'files', label: 'Files' },
  { id: 'search', label: 'Search' },
  { id: 'memory', label: 'Memory' },
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
      <aside className="fixed left-0 top-16 bottom-0 w-56 border-r border-[var(--border)] bg-[var(--card)] flex flex-col z-30">
        {/* Agent identity */}
        <div className="px-4 py-3 border-b border-[var(--border)]">
          <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted-foreground)] mb-1">
            Active Agent
          </p>
          <p className="font-mono text-[11px] text-[var(--muted-foreground)] truncate">{maskedKey}</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-2">
          <p className="mb-1 px-4 text-[10px] font-mono uppercase tracking-wider text-[var(--muted-foreground)]">
            Workspace
          </p>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`flex w-full items-center px-4 py-1.5 text-sm transition-colors ${
                tab === item.id
                  ? 'text-[var(--brand)] bg-[var(--brand-muted)] border-l-2 border-[var(--brand)]'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] border-l-2 border-transparent'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Footer actions */}
        <div className="px-4 py-3 border-t border-[var(--border)]">
          <button
            onClick={onForget}
            className="text-[11px] font-mono text-[var(--muted-foreground)] hover:text-[var(--destructive)] transition-colors"
          >
            Switch agent
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-56 flex-1 min-w-0">
        <AnimatePresence mode="wait">
          {tab === 'files' && (
            <motion.div
              key="files"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="p-6 lg:p-8"
            >
              {/* Stats strip */}
              <div className="flex items-center divide-x divide-[var(--border)] border border-[var(--border)] rounded-sm mb-6">
                {[
                  { label: 'Files', value: files.length },
                  { label: 'Indexed', value: indexedCount },
                  { label: 'Storage', value: formatBytes(totalBytes) },
                ].map((stat) => (
                  <div key={stat.label} className="flex-1 px-4 py-2.5">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted-foreground)]">
                      {stat.label}
                    </p>
                    <p className="text-base font-mono text-[var(--foreground)] tabular-nums">
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Header */}
              <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-lg font-semibold text-[var(--foreground)] tracking-tight">Files</h1>
                  <p className="text-xs font-mono text-[var(--muted-foreground)]">
                    {files.length} total · {formatBytes(totalBytes)} used
                  </p>
                </div>
                <Button
                  onClick={() => setShowUpload(true)}
                  size="sm"
                  className="bg-[var(--brand)] text-[var(--brand-foreground)] hover:opacity-90 text-xs"
                >
                  Upload
                </Button>
              </div>

              {/* Filter */}
              <div className="mb-3">
                <Input
                  placeholder="Filter by name…"
                  value={fileSearch}
                  onChange={(e) => setFileSearch(e.target.value)}
                  className="w-full sm:w-72 text-sm"
                />
              </div>

              {/* File list */}
              {isLoading ? (
                <div className="flex justify-center py-20">
                  <Spinner size="lg" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-[var(--border)]">
                  <p className="text-sm font-medium text-[var(--foreground)]">No files</p>
                  <p className="mt-1 text-xs font-mono text-[var(--muted-foreground)]">Upload a file to get started.</p>
                </div>
              ) : (
                <div className="border border-[var(--border)] rounded-sm divide-y divide-[var(--border)]">
                  <AnimatePresence mode="popLayout">
                    {filtered.map((file) => (
                      <AgentFileRow
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="p-6 lg:p-8"
            >
              <div className="mb-6">
                <h1 className="text-lg font-semibold text-[var(--foreground)] tracking-tight">Semantic Search</h1>
                <p className="text-xs font-mono text-[var(--muted-foreground)]">Search across all indexed files and memories</p>
              </div>
              <AgentSearch apiKey={apiKey} />
            </motion.div>
          )}

          {tab === 'memory' && (
            <motion.div
              key="memory"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="p-6 lg:p-8"
            >
              <div className="mb-6">
                <h1 className="text-lg font-semibold text-[var(--foreground)] tracking-tight">Memory</h1>
                <p className="text-xs font-mono text-[var(--muted-foreground)]">Persistent facts for your agent</p>
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.15 }}
        className="w-full max-w-md rounded-sm border border-[var(--border)] bg-[var(--card)] p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">Upload file</h2>
          <button
            onClick={onClose}
            className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors p-1"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Dropzone */}
        <label className="mb-4 flex cursor-pointer flex-col items-center justify-center rounded-sm border border-dashed border-[var(--border)] bg-[var(--muted)] py-8 hover:border-[var(--brand)]/30 transition-colors">
          <p className="text-sm text-[var(--foreground)]">
            {file ? file.name : 'Click to select a file'}
          </p>
          {file && <p className="text-xs font-mono text-[var(--muted-foreground)] mt-1">{formatBytes(file.size)}</p>}
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
            className={`relative h-4 w-8 rounded-full transition-colors ${
              shouldIndex ? 'bg-[var(--brand)]' : 'bg-[var(--border)]'
            }`}
          >
            <div
              className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-transform ${
                shouldIndex ? 'translate-x-4' : 'translate-x-0.5'
              }`}
            />
          </div>
          <span className="text-sm text-[var(--foreground)]">Index for semantic search</span>
        </label>

        {/* Metadata */}
        <div className="mb-4">
          <label className="mb-1.5 block text-[11px] font-mono uppercase tracking-wider text-[var(--muted-foreground)]">
            Metadata (JSON)
          </label>
          <textarea
            className="w-full resize-none rounded-sm border border-[var(--border)] bg-[var(--muted)] px-3 py-2 font-mono text-xs text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--brand)]/30 focus:border-[var(--brand)]/30"
            rows={3}
            placeholder='{"project": "q3"}'
            value={metaRaw}
            onChange={(e) => setMetaRaw(e.target.value)}
          />
        </div>

        {error && <p className="mb-3 text-xs text-[var(--destructive)]">{error}</p>}

        <div className="flex gap-2">
          <Button variant="secondary" size="sm" className="flex-1" onClick={onClose} disabled={uploading}>
            Cancel
          </Button>
          <Button
            size="sm"
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
