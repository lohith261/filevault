'use client'

import Link from 'next/link'
import { UserButton, SignInButton, SignUpButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/Button'
import { useSafeAuth } from '@/hooks/useSafeAuth'

const CLERK_CONFIGURED = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

export function Navbar() {
  const { isSignedIn } = useSafeAuth()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-sm font-bold text-[var(--foreground)] tracking-tight"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--brand)] to-[var(--brand-secondary)] shadow-lg shadow-[var(--brand-glow)]">
              <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <span className="hidden sm:inline">FileVault</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link href="/agents">
              <Button variant="ghost" size="sm" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                Agents
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="ghost" size="sm" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                Pricing
              </Button>
            </Link>
            <Link href="/help">
              <Button variant="ghost" size="sm" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                Docs
              </Button>
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/agents">
            <Button
              size="sm"
              className="bg-[var(--brand)] text-[var(--brand-foreground)] hover:opacity-90 shadow-md shadow-[var(--brand-glow)] transition-all"
            >
              Get API Key
            </Button>
          </Link>

          {isSignedIn ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                  Dashboard
                </Button>
              </Link>
              <UserButton />
            </>
          ) : CLERK_CONFIGURED ? (
            <>
              <SignInButton mode="modal">
                <Button variant="ghost" size="sm">Log in</Button>
              </SignInButton>
            </>
          ) : null}
        </div>
      </div>
    </header>
  )
}
