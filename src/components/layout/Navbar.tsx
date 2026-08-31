'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { UserButton, SignInButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/Button'
import { useSafeAuth } from '@/hooks/useSafeAuth'

const CLERK_CONFIGURED = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

const NAV_LINKS = [
  { href: '/agents', label: 'Agents' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/help', label: 'Docs' },
]

export function Navbar() {
  const { isSignedIn } = useSafeAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()
  const onAgentsDashboard = pathname === '/agents'

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--border)] bg-[var(--background)]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-bold text-[var(--foreground)] tracking-tight"
          >
            <Image src="/icon.png" alt="FileVault" width={28} height={28} className="rounded-sm" priority />
            <span className="hidden sm:inline">FileVault</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label }) => (
              <Link key={href} href={href}>
                <Button variant="ghost" size="sm" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                  {label}
                </Button>
              </Link>
            ))}
          </nav>
        </div>

        {/* Right: auth + CTA + hamburger */}
        <div className="flex items-center gap-2 sm:gap-3">
          {!onAgentsDashboard && (
            <Link href="/agents">
              <Button size="sm" className="bg-[var(--brand)] text-[var(--brand-foreground)] hover:bg-[var(--brand-hover)] text-xs">
                Get API Key
              </Button>
            </Link>
          )}

          {isSignedIn ? (
            <>
              <Link href="/dashboard" className="hidden sm:block">
                <Button variant="ghost" size="sm" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                  Dashboard
                </Button>
              </Link>
              <UserButton />
            </>
          ) : CLERK_CONFIGURED ? (
            <SignInButton mode="modal">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex">Log in</Button>
            </SignInButton>
          ) : null}

          {/* Hamburger — mobile only */}
          <button
            aria-label="Toggle menu"
            onClick={() => setMenuOpen(o => !o)}
            className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-[5px] rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            <span className={`block h-px w-5 bg-current transition-transform duration-200 ${menuOpen ? 'translate-y-[6px] rotate-45' : ''}`} />
            <span className={`block h-px w-5 bg-current transition-opacity duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-px w-5 bg-current transition-transform duration-200 ${menuOpen ? '-translate-y-[6px] -rotate-45' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="md:hidden border-t border-[var(--border)] bg-[var(--background)] px-4 py-4 flex flex-col gap-1">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2.5 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] rounded-md transition-colors"
            >
              {label}
            </Link>
          ))}
          {isSignedIn && (
            <Link
              href="/dashboard"
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2.5 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] rounded-md transition-colors"
            >
              Dashboard
            </Link>
          )}
          {!isSignedIn && CLERK_CONFIGURED && (
            <SignInButton mode="modal">
              <button
                onClick={() => setMenuOpen(false)}
                className="w-full text-left px-3 py-2.5 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] rounded-md transition-colors"
              >
                Log in
              </button>
            </SignInButton>
          )}
        </div>
      )}
    </header>
  )
}
