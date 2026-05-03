'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'

type Step = 'idle' | 'creating' | 'reveal' | 'enter'

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
    localStorage.setItem('fv_agent_key', newKey)
    onKeyReady(newKey)
  }

  function submitEnterKey() {
    const k = enterKey.trim()
    if (!k.startsWith('fv_sk_')) {
      setError('Key must start with fv_sk_')
      return
    }
    localStorage.setItem('fv_agent_key', k)
    onKeyReady(k)
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <AnimatePresence mode="wait">
        {step === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="w-full max-w-md"
          >
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary)]/10">
                <svg className="h-7 w-7 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 001.591 2.25L21 14.5m-9 0l3.75 4.5M12 3.104v.082m0 0a24.301 24.301 0 00-4.5 0" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-[var(--foreground)]">Agent Dashboard</h1>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                Manage your AI agent's files, search, and memory.
              </p>
            </div>

            <div className="space-y-3">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
                <p className="mb-3 text-sm font-medium text-[var(--foreground)]">New agent</p>
                <Input
                  placeholder="Agent name (optional)"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  className="mb-3"
                />
                <Button className="w-full" onClick={createAgent}>
                  Create agent
                </Button>
              </div>

              <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
                <p className="mb-3 text-sm font-medium text-[var(--foreground)]">Existing agent</p>
                <Input
                  placeholder="fv_sk_..."
                  value={enterKey}
                  onChange={(e) => setEnterKey(e.target.value)}
                  className="mb-3 font-mono text-xs"
                />
                <Button variant="secondary" className="w-full" onClick={submitEnterKey}>
                  Load agent
                </Button>
              </div>
            </div>

            {error && <p className="mt-3 text-center text-sm text-[var(--destructive)]">{error}</p>}
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
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
          >
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--success)]/10">
                  <svg className="h-5 w-5 text-[var(--success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-[var(--foreground)]">Agent created</p>
                  <p className="text-xs text-[var(--muted-foreground)]">Copy your API key — it won't be shown again.</p>
                </div>
              </div>

              <div className="mb-4 rounded-lg border border-[var(--border)] bg-[var(--muted)] px-3 py-2">
                <p className="break-all font-mono text-xs text-[var(--foreground)]">{newKey}</p>
              </div>

              <div className="flex gap-2">
                <Button variant="secondary" className="flex-1" onClick={copy}>
                  {copied ? 'Copied!' : 'Copy key'}
                </Button>
                <Button className="flex-1" onClick={confirmKey}>
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
