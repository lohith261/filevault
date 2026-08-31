'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'

type Step = 'idle' | 'creating' | 'reveal'

interface AgentSetupProps {
  onKeyReady: (key: string) => void
}

export function AgentSetup({ onKeyReady }: AgentSetupProps) {
  const [step, setStep] = useState<Step>('idle')
  const [newKey, setNewKey] = useState('')
  const [agentName, setAgentName] = useState('')
  const [enterKey, setEnterKey] = useState('')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  async function createAgent() {
    setStep('creating')
    setError('')
    try {
      const res = await fetch('/api/v1/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: agentName || undefined }),
      })
      if (!res.ok) throw new Error('Failed to create agent')
      const data = await res.json()
      setNewKey(data.api_key)
      setStep('reveal')
    } catch {
      setError('Could not create agent. Try again.')
      setStep('idle')
    }
  }

  function copy() {
    navigator.clipboard.writeText(newKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function confirmKey() {
    onKeyReady(newKey)
  }

  function submitEnterKey() {
    const k = enterKey.trim()
    if (!k.startsWith('fv_sk_')) {
      setError('Key must start with fv_sk_')
      return
    }
    onKeyReady(k)
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-20">
      <AnimatePresence mode="wait">
        {step === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-sm"
          >
            <div className="mb-8">
              <p className="text-[11px] font-mono uppercase tracking-[0.15em] text-[var(--muted-foreground)] mb-2">
                Agent Dashboard
              </p>
              <h1 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">
                Get started
              </h1>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                Create a new agent or load an existing one.
              </p>
            </div>

            <div className="space-y-3">
              <div className="border border-[var(--border)] rounded-sm p-4">
                <p className="mb-2 text-sm font-medium text-[var(--foreground)]">New agent</p>
                <Input
                  placeholder="Name (optional)"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  className="mb-2 text-sm"
                />
                <Button
                  size="sm"
                  className="w-full bg-[var(--brand)] text-[var(--brand-foreground)] hover:opacity-90"
                  onClick={createAgent}
                >
                  Create agent
                </Button>
              </div>

              <div className="border border-[var(--border)] rounded-sm p-4">
                <p className="mb-2 text-sm font-medium text-[var(--foreground)]">Existing agent</p>
                <Input
                  placeholder="fv_sk_..."
                  value={enterKey}
                  onChange={(e) => setEnterKey(e.target.value)}
                  className="mb-2 font-mono text-xs"
                />
                <Button variant="secondary" size="sm" className="w-full" onClick={submitEnterKey}>
                  Load agent
                </Button>
              </div>
            </div>

            {error && (
              <p className="mt-3 text-xs text-[var(--destructive)]">{error}</p>
            )}
          </motion.div>
        )}

        {step === 'creating' && (
          <motion.div key="creating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
            <Spinner size="lg" />
            <p className="mt-4 text-sm text-[var(--muted-foreground)]">Creating agent…</p>
          </motion.div>
        )}

        {step === 'reveal' && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-sm"
          >
            <div className="border border-[var(--border)] rounded-sm p-5">
              <div className="mb-4 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[var(--success)]" />
                <p className="text-sm font-medium text-[var(--foreground)]">Agent created</p>
              </div>
              <p className="mb-3 text-xs text-[var(--muted-foreground)]">
                Copy your API key — it won&apos;t be shown again.
              </p>

              <div className="mb-4 rounded-sm border border-[var(--border)] bg-[var(--muted)] px-3 py-2.5">
                <p className="break-all font-mono text-xs text-[var(--foreground)]">{newKey}</p>
              </div>

              <div className="flex gap-2">
                <Button variant="secondary" size="sm" className="flex-1" onClick={copy}>
                  {copied ? 'Copied' : 'Copy'}
                </Button>
                <Button
                  size="sm"
                  className="flex-1 bg-[var(--brand)] text-[var(--brand-foreground)] hover:opacity-90"
                  onClick={confirmKey}
                >
                  Open dashboard →
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
