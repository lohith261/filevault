import Link from 'next/link'

export default function LinkExpired() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 text-center">
      <p className="text-5xl select-none">⏰</p>
      <h1 className="mt-4 text-2xl font-semibold text-[var(--foreground)]">Link expired</h1>
      <p className="mt-2 text-sm text-[var(--muted-foreground)]">
        This link has passed its expiry date and is no longer available.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] transition-opacity hover:opacity-90"
      >
        Upload a new file
      </Link>
    </div>
  )
}
