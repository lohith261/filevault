'use client'

import Link from 'next/link'
import { UserButton, SignInButton, SignUpButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/Button'
import { useSafeAuth } from '@/hooks/useSafeAuth'

const CLERK_CONFIGURED = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

export function Navbar() {
  const { isSignedIn } = useSafeAuth()

  return (
    <header className="fixed top-0 left-0 right-0 z-40 border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[var(--foreground)]">
              <svg className="h-3.5 w-3.5 text-[var(--primary-foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <span>FileVault</span>
          </Link>

          <nav className="hidden md:flex items-center gap-0.5">
            <Link href="/pricing">
              <Button variant="ghost" size="sm" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">Pricing</Button>
            </Link>
            <Link href="/agents">
              <Button variant="ghost" size="sm" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">Agents</Button>
            </Link>
            <Link href="/help">
              <Button variant="ghost" size="sm" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">Docs</Button>
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {isSignedIn ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">Dashboard</Button>
              </Link>
              <UserButton />
            </>
          ) : CLERK_CONFIGURED ? (
            <>
              <SignInButton mode="modal">
                <Button variant="outline" size="sm">Log in</Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button size="sm" className="bg-[var(--foreground)] text-[var(--primary-foreground)] hover:bg-[var(--foreground)]/90">
                  Sign up
                </Button>
              </SignUpButton>
            </>
          ) : null}
        </div>
      </div>
    </header>
  )
}
