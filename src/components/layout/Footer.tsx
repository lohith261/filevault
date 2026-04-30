export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] py-8 text-center text-sm text-[var(--muted-foreground)]">
      <div className="mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>© {new Date().getFullYear()} FileVault. Host anything, instantly.</p>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-[var(--foreground)] transition-colors">Privacy</a>
          <a href="#" className="hover:text-[var(--foreground)] transition-colors">Terms</a>
          <a href="#" className="hover:text-[var(--foreground)] transition-colors">API</a>
        </div>
      </div>
    </footer>
  )
}
