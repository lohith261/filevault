'use client'

import Link from 'next/link'
import { useAuth, UserButton, SignInButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

const CLERK_CONFIGURED = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

function useSafeAuth() {
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { isSignedIn, has } = useAuth()
    return { isSignedIn: isSignedIn ?? false, has }
  } catch {
    return { isSignedIn: false, has: undefined }
  }
}

export function Navbar() {
  const { isSignedIn, has } = useSafeAuth()
  const isPro = isSignedIn ? (has?.({ plan: 'user:pro' }) ?? false) : false

  return (
    <header className="fixed top-0 left-0 right-0 z-40 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-[var(--foreground)]">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--primary)]">
            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <span>FileVault</span>
        </Link>

        <nav className="flex items-center gap-2">
          <Link href="/pricing">
            <Button variant="ghost" size="sm">Pricing</Button>
          </Link>
          <Link href="/help">
            <Button variant="ghost" size="sm">Help</Button>
          </Link>

          {isSignedIn ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">Dashboard</Button>
              </Link>
              {isPro && (
                <Badge variant="success" className="hidden sm:inline-flex">Pro</Badge>
              )}
              <UserButton />
            </>
          ) : CLERK_CONFIGURED ? (
            <SignInButton mode="modal">
              <Button variant="outline" size="sm">Sign in</Button>
            </SignInButton>
          ) : null}
        </nav>
      </div>
    </header>
  )
}
