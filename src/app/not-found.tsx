import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 text-center">
      <p className="text-6xl font-bold text-[var(--primary)] opacity-30 select-none">404</p>
      <h1 className="mt-4 text-2xl font-semibold text-[var(--foreground)]">Page not found</h1>
      <p className="mt-2 text-sm text-[var(--muted-foreground)]">
        This link doesn&apos;t exist or may have been deleted.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] transition-opacity hover:opacity-90"
      >
        Back to FileVault
      </Link>
    </div>
  )
}
