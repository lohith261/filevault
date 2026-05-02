import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--background)]">
      <div className="mx-auto max-w-6xl px-6 py-10 flex flex-col sm:flex-row items-start justify-between gap-8">
        <div>
          <p className="font-bold text-[var(--foreground)]">FileVault</p>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">Host anything, instantly.</p>
        </div>
        <nav className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-[var(--muted-foreground)]">
          <Link href="/pricing" className="hover:text-[var(--foreground)] transition-colors">Pricing</Link>
          <Link href="/help" className="hover:text-[var(--foreground)] transition-colors">Help</Link>
          <Link href="/privacy" className="hover:text-[var(--foreground)] transition-colors">Privacy</Link>
          <Link href="/tos" className="hover:text-[var(--foreground)] transition-colors">Terms</Link>
        </nav>
      </div>
      <div className="border-t border-[var(--border)] px-6 py-4">
        <p className="mx-auto max-w-6xl text-xs text-[var(--muted-foreground)]">
          © {new Date().getFullYear()} FileVault
        </p>
      </div>
    </footer>
  )
}
