import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--background)] relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-[var(--border)]" />

      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-10">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-[var(--brand)]">
                <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <span className="font-bold text-[var(--foreground)] tracking-tight">FileVault</span>
            </div>
            <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
              The storage layer AI agents actually need. Files, memory, semantic search, and
              agent-to-agent sharing — one API.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 lg:gap-16">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)] mb-3">Product</p>
              <nav className="flex flex-col gap-2 text-sm text-[var(--muted-foreground)]">
                <Link href="/agents" className="hover:text-[var(--brand)] transition-colors">Agent API</Link>
                <Link href="/pricing" className="hover:text-[var(--brand)] transition-colors">Pricing</Link>
                <Link href="/help" className="hover:text-[var(--brand)] transition-colors">Documentation</Link>
              </nav>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)] mb-3">Developers</p>
              <nav className="flex flex-col gap-2 text-sm text-[var(--muted-foreground)]">
                <Link href="/help" className="hover:text-[var(--brand)] transition-colors">API Reference</Link>
                <Link href="/help" className="hover:text-[var(--brand)] transition-colors">TypeScript SDK</Link>
                <Link href="/help" className="hover:text-[var(--brand)] transition-colors">Python SDK</Link>
              </nav>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)] mb-3">Legal</p>
              <nav className="flex flex-col gap-2 text-sm text-[var(--muted-foreground)]">
                <Link href="/privacy" className="hover:text-[var(--brand)] transition-colors">Privacy</Link>
                <Link href="/tos" className="hover:text-[var(--brand)] transition-colors">Terms</Link>
              </nav>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[var(--muted-foreground)]">
            © {new Date().getFullYear()} FileVault. Built for agents.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/lohith261/filevault"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
