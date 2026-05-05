'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'

interface SearchResult {
  id: string
  type: 'file' | 'memory'
  content: string
  score: number
  file_id?: string
  url?: string
}

interface AgentSearchProps {
  apiKey: string
}

type FilterType = 'all' | 'files' | 'memory'

export function AgentSearch({ apiKey }: AgentSearchProps) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<FilterType>('all')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState('')

  async function search() {
    if (!query.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/v1/search', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim(), filter: { type: filter }, limit: 10 }),
      })
      if (!res.ok) throw new Error('Search failed')
      const data = await res.json()
      setResults(data.results)
      setSearched(true)
    } catch {
      setError('Search failed. Check your API key and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Search bar */}
      <div className="flex gap-2">
        <Input
          placeholder="Ask anything about your files and memories…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && search()}
          className="flex-1"
        />
        <Button
          onClick={search}
          disabled={loading || !query.trim()}
          className="bg-[var(--brand)] text-[var(--brand-foreground)] hover:opacity-90 shadow-md shadow-[var(--brand-glow)]"
        >
          {loading ? <Spinner size="sm" /> : 'Search'}
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 rounded-xl border border-[var(--border)] bg-[var(--muted)] p-1 w-fit">
        {(['all', 'files', 'memory'] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold capitalize transition-all ${
              filter === f
                ? 'bg-[var(--card)] text-[var(--foreground)] shadow-sm border border-[var(--border)]'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-[var(--destructive)]">{error}</p>}

      {/* Results */}
      {searched && results.length === 0 && !loading && (
        <div className="rounded-xl border border-dashed border-[var(--border)] py-16 text-center bg-[var(--card)]/50">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--muted)] mx-auto">
            <svg className="h-5 w-5 text-[var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="text-sm text-[var(--muted-foreground)]">No results found for &quot;{query}&quot;</p>
        </div>
      )}

      <AnimatePresence mode="popLayout">
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            <p className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
              {results.length} {results.length === 1 ? 'result' : 'results'}
            </p>
            {results.map((result, i) => (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 hover:border-[var(--brand)]/20 transition-all duration-200"
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                        result.type === 'file'
                          ? 'bg-[var(--brand-muted)] text-[var(--brand)]'
                          : 'bg-[var(--muted)] text-[var(--muted-foreground)]'
                      }`}
                    >
                      {result.type === 'file' ? (
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      ) : (
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      )}
                      {result.type}
                    </span>
                    {result.url && (
                      <a
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[var(--brand)] hover:underline font-medium"
                      >
                        Open file ↗
                      </a>
                    )}
                  </div>
                  <span className="text-xs font-mono font-medium text-[var(--muted-foreground)] bg-[var(--muted)] px-2 py-0.5 rounded-md">
                    {(result.score * 100).toFixed(1)}% match
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-[var(--foreground)] line-clamp-4">
                  {result.content}
                </p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
