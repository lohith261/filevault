'use client'

import { useState } from 'react'
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
          placeholder="Search your files and memories…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && search()}
          className="flex-1"
        />
        <Button onClick={search} disabled={loading || !query.trim()}>
          {loading ? <Spinner size="sm" /> : 'Search'}
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 rounded-lg border border-[var(--border)] bg-[var(--muted)] p-1 w-fit">
        {(['all', 'files', 'memory'] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors ${
              filter === f
                ? 'bg-[var(--card)] text-[var(--foreground)] shadow-sm'
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
        <div className="rounded-xl border border-dashed border-[var(--border)] py-12 text-center">
          <p className="text-sm text-[var(--muted-foreground)]">No results found for "{query}"</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-3">
          {results.map((result) => (
            <div
              key={result.id}
              className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-medium ${
                      result.type === 'file'
                        ? 'bg-[var(--primary)]/10 text-[var(--primary)]'
                        : 'bg-[var(--muted)] text-[var(--muted-foreground)]'
                    }`}
                  >
                    {result.type}
                  </span>
                  {result.url && (
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[var(--primary)] hover:underline"
                    >
                      Open file ↗
                    </a>
                  )}
                </div>
                <span className="text-xs font-mono text-[var(--muted-foreground)]">
                  {(result.score * 100).toFixed(1)}% match
                </span>
              </div>
              <p className="text-sm leading-relaxed text-[var(--foreground)] line-clamp-4">
                {result.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
