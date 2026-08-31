import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 text-center">
      <p className="text-7xl font-bold text-[var(--brand)] opacity-20 select-none tabular-nums">404</p>
      <h1 className="mt-4 text-2xl font-semibold text-[var(--foreground)]">Page not found</h1>
      <p className="mt-2 text-sm text-[var(--muted-foreground)] max-w-xs">
        This link doesn&apos;t exist or may have been deleted.
      </p>
      <div className="mt-6 flex gap-3">
        <Link
          href="/"
          className="rounded-lg bg-[var(--brand)] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--brand-hover)]"
        >
          Go home
        </Link>
        <Link
          href="/help"
          className="rounded-lg border border-[var(--border)] px-5 py-2 text-sm font-medium text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)] hover:border-white/20"
        >
          View docs
        </Link>
      </div>
    </div>
  )
}
