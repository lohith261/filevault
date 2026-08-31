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

const NAV_ITEMS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  {
    id: 'files',
    label: 'Files',
    icon: (
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
  },
  {
    id: 'search',
    label: 'Search',
    icon: (
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
    ),
  },
  {
    id: 'memory',
    label: 'Memory',
    icon: (
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
  },
]

export function AgentDashboard({ apiKey, onForget }: AgentDashboardProps) {
  const [tab, setTab] = useState<Tab>('files')
  const [fileSearch, setFileSearch] = useState('')
  const [showUpload, setShowUpload] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const { files, isLoading, deleteFile, indexFile, uploadFile } = useAgentFiles(apiKey)

  const maskedKey = `fv_sk_…${apiKey.slice(-6)}`

  const filtered = fileSearch
    ? files.filter((f) => f.name.toLowerCase().includes(fileSearch.toLowerCase()))
    : files

  const indexedCount = files.filter((f) => f.is_indexed).length
  const totalBytes = files.reduce((s, f) => s + f.size_bytes, 0)

  const Sidebar = () => (
    <aside className="flex flex-col h-full">
      {/* Agent identity */}
      <div className="px-4 py-3 border-b border-[var(--border)]">
        <p className="text-[10px] text-[var(--muted-foreground)] mb-0.5">Active agent</p>
        <p className="font-mono text-[11px] text-[var(--foreground)] truncate">{maskedKey}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-0.5">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => { setTab(item.id); setSidebarOpen(false) }}
            className={`flex w-full items-center gap-2.5 px-3 py-2 text-sm rounded-md transition-colors ${
              tab === item.id
                ? 'text-[var(--brand)] bg-[var(--brand-muted)]'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]'
            }`}
          >
            <span className={tab === item.id ? 'text-[var(--brand)]' : 'text-[var(--muted-foreground)]'}>
              {item.icon}
            </span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-[var(--border)]">
        <button
          onClick={onForget}
          className="text-[11px] text-[var(--muted-foreground)] hover:text-[var(--destructive)] transition-colors"
        >
          Switch agent
        </button>
      </div>
    </aside>
  )

  return (
    <div className="flex min-h-screen pt-16 bg-[var(--background)]">
      {/* Desktop sidebar */}
      <div className="hidden md:block fixed left-0 top-16 bottom-0 w-52 border-r border-[var(--border)] bg-[var(--card)] z-30">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="w-52 bg-[var(--card)] border-r border-[var(--border)] flex flex-col">
            <Sidebar />
          </div>
          <div className="flex-1 bg-black/40" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main content */}
      <main className="md:ml-52 flex-1 min-w-0">
        {/* Mobile header bar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-[var(--border)]">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            aria-label="Open menu"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          <span className="text-sm font-medium text-[var(--foreground)] capitalize">{tab}</span>
        </div>

        <AnimatePresence mode="wait">
          {tab === 'files' && (
            <motion.div
              key="files"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="p-4 sm:p-6 lg:p-8"
            >
              {/* Stats strip */}
              <div className="flex items-center divide-x divide-[var(--border)] border border-[var(--border)] rounded-lg mb-6 overflow-hidden">
                {[
                  { label: 'Files', value: files.length },
                  { label: 'Indexed', value: indexedCount },
                  { label: 'Storage', value: formatBytes(totalBytes) },
                ].map((stat) => (
                  <div key={stat.label} className="flex-1 px-4 py-3">
                    <p className="text-[10px] text-[var(--muted-foreground)] mb-0.5">{stat.label}</p>
                    <p className="text-lg font-semibold text-[var(--foreground)] tabular-nums leading-none">
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Header */}
              <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-base font-semibold text-[var(--foreground)]">Files</h1>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {files.length} total · {formatBytes(totalBytes)} used
                  </p>
                </div>
                <Button
                  onClick={() => setShowUpload(true)}
                  size="sm"
                  className="bg-[var(--brand)] text-[var(--brand-foreground)] hover:bg-[var(--brand-hover)] text-xs"
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
                <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-[var(--border)] rounded-lg">
                  <svg className="h-8 w-8 text-[var(--muted-foreground)] mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  <p className="text-sm font-medium text-[var(--foreground)]">No files yet</p>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">Upload your first file to get started.</p>
                  <button
                    onClick={() => setShowUpload(true)}
                    className="mt-4 text-xs text-[var(--brand)] hover:underline underline-offset-2"
                  >
                    Upload a file →
                  </button>
                </div>
              ) : (
                <div className="border border-[var(--border)] rounded-lg divide-y divide-[var(--border)] overflow-hidden">
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
              className="p-4 sm:p-6 lg:p-8"
            >
              <div className="mb-6">
                <h1 className="text-base font-semibold text-[var(--foreground)]">Semantic Search</h1>
                <p className="text-xs text-[var(--muted-foreground)]">Search across all indexed files and memories</p>
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
              className="p-4 sm:p-6 lg:p-8"
            >
              <div className="mb-6">
                <h1 className="text-base font-semibold text-[var(--foreground)]">Memory</h1>
                <p className="text-xs text-[var(--muted-foreground)]">Persistent facts your agent can recall</p>
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
  const [success, setSuccess] = useState(false)

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
      setError('Metadata must be valid JSON — check syntax and try again.')
      return
    }
    setUploading(true)
    setError('')
    try {
      await onUpload(file, shouldIndex, meta)
      setSuccess(true)
      setTimeout(onClose, 800)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed. Please try again.')
      setUploading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-4 pb-4 sm:pb-0"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 16 }}
        transition={{ duration: 0.18 }}
        className="w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-2xl shadow-black/40"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">Upload file</h2>
          <button
            onClick={onClose}
            className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors p-1 rounded-md hover:bg-[var(--muted)]"
            aria-label="Close"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Dropzone */}
        <label className="mb-4 flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-[var(--border)] bg-[var(--muted)] py-8 hover:border-[var(--brand)]/40 hover:bg-[var(--brand)]/[0.03] transition-colors">
          {file ? (
            <>
              <svg className="h-5 w-5 text-[var(--brand)] mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5" />
              </svg>
              <p className="text-sm font-medium text-[var(--foreground)]">{file.name}</p>
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{formatBytes(file.size)}</p>
            </>
          ) : (
            <>
              <svg className="h-5 w-5 text-[var(--muted-foreground)] mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              <p className="text-sm text-[var(--foreground)]">Click to select a file</p>
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">Max 50 MB</p>
            </>
          )}
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
          <label className="mb-1.5 block text-xs text-[var(--muted-foreground)]">
            Metadata <span className="font-mono">(JSON, optional)</span>
          </label>
          <textarea
            className="w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--muted)] px-3 py-2 font-mono text-xs text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--brand)]/30 focus:border-[var(--brand)]/30"
            rows={3}
            placeholder='{"project": "q3"}'
            value={metaRaw}
            onChange={(e) => { setMetaRaw(e.target.value); setError('') }}
          />
        </div>

        {error && (
          <div className="mb-3 flex items-start gap-2 rounded-lg bg-[var(--destructive)]/10 border border-[var(--destructive)]/20 px-3 py-2">
            <svg className="h-3.5 w-3.5 text-[var(--destructive)] mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
            </svg>
            <p className="text-xs text-[var(--destructive)]">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-3 flex items-center gap-2 rounded-lg bg-[var(--success)]/10 border border-[var(--success)]/20 px-3 py-2">
            <svg className="h-3.5 w-3.5 text-[var(--success)] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-xs text-[var(--success)]">File uploaded successfully.</p>
          </div>
        )}

        <div className="flex gap-2">
          <Button variant="secondary" size="sm" className="flex-1" onClick={onClose} disabled={uploading}>
            Cancel
          </Button>
          <Button
            size="sm"
            className="flex-1 bg-[var(--brand)] text-[var(--brand-foreground)] hover:bg-[var(--brand-hover)]"
            onClick={handleUpload}
            disabled={!file || uploading || success}
          >
            {uploading ? <Spinner size="sm" /> : 'Upload'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}
