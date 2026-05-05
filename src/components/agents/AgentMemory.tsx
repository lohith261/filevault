'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { useAgentMemory, type MemoryRecord } from '@/hooks/useAgentMemory'

interface AgentMemoryProps {
  apiKey: string
}

export function AgentMemory({ apiKey }: AgentMemoryProps) {
  const { memories, isLoading, addMemory } = useAgentMemory(apiKey)
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleAdd() {
    if (!content.trim()) return
    setSaving(true)
    setError('')
    try {
      await addMemory(content.trim())
      setContent('')
    } catch {
      setError('Failed to save memory.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Add memory */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
        <p className="mb-3 text-sm font-semibold text-[var(--foreground)]">Add memory</p>
        <textarea
          className="w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--muted)] px-3 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/20 focus:border-[var(--brand)]/30 transition-all"
          rows={3}
          placeholder="Store any text as agent memory — preferences, facts, context…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        {error && <p className="mt-1.5 text-xs text-[var(--destructive)]">{error}</p>}
        <div className="mt-3 flex justify-end">
          <Button
            onClick={handleAdd}
            disabled={saving || !content.trim()}
            className="bg-[var(--brand)] text-[var(--brand-foreground)] hover:opacity-90 shadow-md shadow-[var(--brand-glow)]"
          >
            {saving ? <Spinner size="sm" /> : 'Save memory'}
          </Button>
        </div>
      </div>

      {/* Memory list */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Spinner size="lg" />
        </div>
      ) : memories.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--border)] py-16 text-center bg-[var(--card)]/50">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--muted)] mx-auto">
            <svg className="h-5 w-5 text-[var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <p className="text-sm text-[var(--muted-foreground)]">No memories stored yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
            {memories.length} {memories.length === 1 ? 'memory' : 'memories'}
          </p>
          <AnimatePresence>
            {memories.map((m: MemoryRecord) => (
              <motion.div
                key={m.memory_id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 hover:border-[var(--brand)]/20 transition-all duration-200"
              >
                <p className="text-sm leading-relaxed text-[var(--foreground)]">{m.content}</p>
                <div className="mt-3 flex items-center gap-3 text-xs text-[var(--muted-foreground)]">
                  <span className="inline-flex items-center gap-1">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {new Date(m.created_at).toLocaleString()}
                  </span>
                  {m.expires_at && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-[var(--warning)]/10 px-1.5 py-0.5 text-[var(--warning)]">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Expires {new Date(m.expires_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
