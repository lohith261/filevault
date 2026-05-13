'use client'

import Link from 'next/link'
import Image from 'next/image'
import { UserButton, SignInButton, SignUpButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/Button'
import { useSafeAuth } from '@/hooks/useSafeAuth'

const CLERK_CONFIGURED = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

export function Navbar() {
  const { isSignedIn } = useSafeAuth()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--border)] bg-[var(--background)]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-bold text-[var(--foreground)] tracking-tight"
          >
            <Image
              src="/icon.png"
              alt="FileVault"
              width={28}
              height={28}
              className="rounded-sm"
              priority
            />
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
              className="bg-[var(--brand)] text-[var(--brand-foreground)] hover:opacity-90 text-xs"
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
