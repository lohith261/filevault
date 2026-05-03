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
    <div className="space-y-4">
      {/* Add memory */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
        <p className="mb-2 text-sm font-medium text-[var(--foreground)]">Add memory</p>
        <textarea
          className="w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
          rows={3}
          placeholder="Store any text as agent memory — preferences, facts, context…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        {error && <p className="mt-1 text-xs text-[var(--destructive)]">{error}</p>}
        <div className="mt-2 flex justify-end">
          <Button onClick={handleAdd} disabled={saving || !content.trim()}>
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
        <div className="rounded-xl border border-dashed border-[var(--border)] py-12 text-center">
          <p className="text-sm text-[var(--muted-foreground)]">No memories stored yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide">
            {memories.length} {memories.length === 1 ? 'memory' : 'memories'}
          </p>
          <AnimatePresence>
            {memories.map((m: MemoryRecord) => (
              <motion.div
                key={m.memory_id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4"
              >
                <p className="text-sm leading-relaxed text-[var(--foreground)]">{m.content}</p>
                <div className="mt-2 flex items-center gap-3 text-xs text-[var(--muted-foreground)]">
                  <span>{new Date(m.created_at).toLocaleString()}</span>
                  {m.expires_at && (
                    <span>Expires {new Date(m.expires_at).toLocaleDateString()}</span>
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
