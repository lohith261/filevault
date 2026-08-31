'use client'

import { useState } from 'react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { UserButton, SignInButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/Button'
import { useSafeAuth } from '@/hooks/useSafeAuth'

const CLERK_CONFIGURED = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
const BASE_DOMAIN = process.env.NEXT_PUBLIC_BASE_DOMAIN ?? 'filevault.host'

export function Navbar() {
  const { isSignedIn } = useSafeAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  const onDashboardSubdomain =
    typeof window !== 'undefined' &&
    window.location.hostname === `dashboard.${BASE_DOMAIN}`

  const href = (path: string) =>
    onDashboardSubdomain ? `https://${BASE_DOMAIN}${path}` : path

  const NAV_LINKS = [
    { href: href('/agents'), label: 'Agents' },
    { href: href('/pricing'), label: 'Pricing' },
    { href: href('/help'), label: 'Docs' },
  ]

  const onAgentsDashboard = pathname === '/agents'

  // Style sets
  const dark = onDashboardSubdomain
  const headerBg = dark
    ? 'bg-[#07070d]/90 border-white/[0.06]'
    : 'bg-white/90 border-[#e8e8e8]'
  const brandColor = dark ? 'text-[#eeeef5]' : 'text-[#0a0a0a]'
  const linkColor = dark
    ? 'text-[#71717a] hover:text-[#eeeef5]'
    : 'text-[#666] hover:text-[#0a0a0a]'
  const mobileRowColor = dark
    ? 'text-[#71717a] hover:text-[#eeeef5] hover:bg-white/5'
    : 'text-[#666] hover:text-[#0a0a0a] hover:bg-[#f9f9f9]'

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-md ${headerBg}`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <a
            href={href('/')}
            className={`flex items-center gap-2.5 text-[15px] font-semibold tracking-[-0.02em] ${brandColor}`}
          >
            <Image src="/icon.png" alt="FileVault" width={26} height={26} className="rounded-sm" priority />
            <span className="hidden sm:inline">FileVault</span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {NAV_LINKS.map(({ href: navHref, label }) => (
              <a
                key={label}
                href={navHref}
                className={`px-3 py-1.5 text-[13.5px] rounded-md transition-colors ${linkColor}`}
              >
                {label}
              </a>
            ))}
          </nav>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {!onAgentsDashboard && !isSignedIn && (
            <a href={href('/agents')}>
              <Button
                size="sm"
                className={`text-xs font-medium ${
                  dark
                    ? 'bg-[#5865f2] text-white hover:bg-[#4757e0]'
                    : 'bg-[#0a0a0a] text-white hover:bg-[#333]'
                }`}
              >
                Get started
              </Button>
            </a>
          )}

          {isSignedIn ? (
            <>
              <a
                href={`https://dashboard.${BASE_DOMAIN}`}
                className={`hidden sm:inline-flex px-3 py-1.5 text-[13.5px] rounded-md transition-colors ${linkColor}`}
              >
                Dashboard
              </a>
              <UserButton />
            </>
          ) : CLERK_CONFIGURED ? (
            <SignInButton mode="modal">
              <button
                className={`hidden sm:inline-flex px-3 py-1.5 text-[13.5px] rounded-md transition-colors ${linkColor}`}
              >
                Log in
              </button>
            </SignInButton>
          ) : null}

          {/* Hamburger */}
          <button
            aria-label="Toggle menu"
            onClick={() => setMenuOpen((o) => !o)}
            className={`md:hidden flex flex-col justify-center items-center w-8 h-8 gap-[5px] rounded transition-colors ${linkColor}`}
          >
            <span className={`block h-px w-5 bg-current transition-transform duration-200 ${menuOpen ? 'translate-y-[6px] rotate-45' : ''}`} />
            <span className={`block h-px w-5 bg-current transition-opacity duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-px w-5 bg-current transition-transform duration-200 ${menuOpen ? '-translate-y-[6px] -rotate-45' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div
          className={`md:hidden border-t px-5 py-4 flex flex-col gap-1 ${
            dark ? 'border-white/[0.06] bg-[#07070d]' : 'border-[#e8e8e8] bg-white'
          }`}
        >
          {NAV_LINKS.map(({ href: navHref, label }) => (
            <a
              key={label}
              href={navHref}
              onClick={() => setMenuOpen(false)}
              className={`block px-3 py-2.5 text-sm rounded-md transition-colors ${mobileRowColor}`}
            >
              {label}
            </a>
          ))}
          {isSignedIn && (
            <a
              href={`https://dashboard.${BASE_DOMAIN}`}
              onClick={() => setMenuOpen(false)}
              className={`block px-3 py-2.5 text-sm rounded-md transition-colors ${mobileRowColor}`}
            >
              Dashboard
            </a>
          )}
          {!isSignedIn && CLERK_CONFIGURED && (
            <SignInButton mode="modal">
              <button
                onClick={() => setMenuOpen(false)}
                className={`w-full text-left px-3 py-2.5 text-sm rounded-md transition-colors ${mobileRowColor}`}
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
