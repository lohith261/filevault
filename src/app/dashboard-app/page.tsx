'use client'

import { useAuth, SignInButton } from '@clerk/nextjs'
import { AgentDashboard } from '@/components/agents/AgentDashboard'
import { Button } from '@/components/ui/Button'

export default function DashboardAppPage() {
  const { isSignedIn, userId } = useAuth()

  if (isSignedIn && userId) {
    return <AgentDashboard userId={userId} />
  }

  return (
    <div className="dark-theme min-h-screen flex flex-col items-center justify-center px-6 text-center bg-[var(--background)]">
      <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">
        Sign in to access your dashboard
      </h1>
      <p className="text-sm text-[var(--muted-foreground)] mb-6 max-w-sm">
        Your agents, files, and memories are waiting. Sign in to continue.
      </p>
      <SignInButton mode="modal">
        <Button className="px-6 py-2.5 bg-[var(--brand)] text-white hover:bg-[var(--brand-hover)]">
          Sign in →
        </Button>
      </SignInButton>
    </div>
  )
}
