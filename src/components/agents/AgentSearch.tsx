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
    <div className="space-y-4">
      {/* Search bar */}
      <div className="flex gap-2">
        <Input
          placeholder="Query across files and memory…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && search()}
          className="flex-1 text-sm"
        />
        <Button
          onClick={search}
          disabled={loading || !query.trim()}
          size="sm"
          className="bg-[var(--brand)] text-[var(--brand-foreground)] hover:opacity-90"
        >
          {loading ? <Spinner size="sm" /> : 'Search'}
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 w-fit border border-[var(--border)] rounded-sm p-0.5">
        {(['all', 'files', 'memory'] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 text-[11px] font-mono uppercase tracking-wider transition-colors ${
              filter === f
                ? 'bg-[var(--muted)] text-[var(--foreground)]'
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
        <div className="border border-dashed border-[var(--border)] py-12 text-center">
          <p className="text-sm text-[var(--muted-foreground)]">No results for &quot;{query}&quot;</p>
        </div>
      )}

      <AnimatePresence mode="popLayout">
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-0 border border-[var(--border)] rounded-sm divide-y divide-[var(--border)]"
          >
            {results.map((result, i) => (
              <motion.div
                key={result.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="px-4 py-3 hover:bg-[var(--muted)]/50 transition-colors"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono uppercase tracking-wider ${
                      result.type === 'file' ? 'text-[var(--brand)]' : 'text-[var(--muted-foreground)]'
                    }`}>
                      {result.type}
                    </span>
                    {result.url && (
                      <a
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-mono text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                      >
                        Open ↗
                      </a>
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-[var(--muted-foreground)] tabular-nums">
                    {(result.score * 100).toFixed(1)}%
                  </span>
                </div>
                <p className="text-sm text-[var(--foreground)] leading-relaxed line-clamp-3">
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
