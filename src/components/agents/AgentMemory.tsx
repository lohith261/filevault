'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { useAgentMemory, type MemoryRecord } from '@/hooks/useAgentMemory'

interface AgentMemoryProps {
  agentId: string
}

export function AgentMemory({ agentId }: AgentMemoryProps) {
  const { memories, isLoading, addMemory } = useAgentMemory(agentId)
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
      <div className="border border-[var(--border)] rounded-sm p-4">
        <p className="mb-2 text-[11px] font-mono uppercase tracking-wider text-[var(--muted-foreground)]">
          Add memory
        </p>
        <textarea
          className="w-full resize-none rounded-sm border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--brand)]/30 focus:border-[var(--brand)]/30"
          rows={3}
          placeholder="Store any text as agent memory — preferences, facts, context…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        {error && <p className="mt-1.5 text-xs text-[var(--destructive)]">{error}</p>}
        <div className="mt-2 flex justify-end">
          <Button
            onClick={handleAdd}
            disabled={saving || !content.trim()}
            size="sm"
            className="bg-[var(--brand)] text-[var(--brand-foreground)] hover:opacity-90"
          >
            {saving ? <Spinner size="sm" /> : 'Save'}
          </Button>
        </div>
      </div>

      {/* Memory list */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Spinner size="lg" />
        </div>
      ) : memories.length === 0 ? (
        <div className="border border-dashed border-[var(--border)] py-12 text-center">
          <p className="text-sm text-[var(--muted-foreground)]">No memories stored.</p>
        </div>
      ) : (
        <div className="space-y-0 border border-[var(--border)] rounded-sm divide-y divide-[var(--border)]">
          <AnimatePresence>
            {memories.map((m: MemoryRecord) => (
              <motion.div
                key={m.memory_id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="px-4 py-3 hover:bg-[var(--muted)]/50 transition-colors"
              >
                <p className="text-sm text-[var(--foreground)] leading-relaxed">{m.content}</p>
                <div className="mt-2 flex items-center gap-3 text-[11px] font-mono text-[var(--muted-foreground)]">
                  <span>{new Date(m.created_at).toLocaleString()}</span>
                  {m.expires_at && (
                    <span className="text-[var(--warning)]">
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
