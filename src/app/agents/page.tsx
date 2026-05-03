'use client'

import { useEffect, useState } from 'react'
import { AgentSetup } from '@/components/agents/AgentSetup'
import { AgentDashboard } from '@/components/agents/AgentDashboard'

const STORAGE_KEY = 'fv_agent_key'

export default function AgentsPage() {
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  // Read key from localStorage after hydration (avoids SSR mismatch)
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    setApiKey(stored)
    setReady(true)
  }, [])

  function handleKeyReady(key: string) {
    localStorage.setItem(STORAGE_KEY, key)
    setApiKey(key)
  }

  function handleForget() {
    localStorage.removeItem(STORAGE_KEY)
    setApiKey(null)
  }

  if (!ready) return null

  if (!apiKey) {
    return <AgentSetup onKeyReady={handleKeyReady} />
  }

  return <AgentDashboard apiKey={apiKey} onForget={handleForget} />
}
