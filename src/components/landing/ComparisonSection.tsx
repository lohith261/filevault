// Server component — no client JS needed.

const ROWS = [
  { without: 'S3 + Pinecone + Redis + custom auth',   with: 'One API key. One base URL.' },
  { without: 'Build your own chunking & embed pipeline', with: 'Upload with index=true. Done.' },
  { without: 'Lose memory between agent sessions',    with: 'Persistent memory with optional TTL.' },
  { without: 'Manually share credentials between agents', with: 'POST /v1/shares — revocable, scoped.' },
  { without: 'Write your own rate limiter',           with: '20 uploads/min enforced per agent.' },
  { without: 'Ship code to get MCP working',          with: 'Clone repo, add 4 lines of JSON config.' },
]

export function ComparisonSection() {
  return (
    <section className="py-20 px-6 border-t border-[var(--border)]">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 animate-fade-in-up">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] tracking-tight">
            Replace the duct tape.
          </h2>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            Everything your agent pipeline needs — already assembled.
          </p>
        </div>

        <div className="rounded-xl border border-[var(--border)] overflow-hidden animate-fade-in-up animation-delay-100">
          {/* Header */}
          <div className="grid grid-cols-2 border-b border-[var(--border)]">
            <div className="px-5 py-3 flex items-center gap-2 border-r border-[var(--border)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--destructive)]" />
              <span className="text-[11px] font-semibold uppercase tracking-widest text-[var(--muted-foreground)]">Without FileVault</span>
            </div>
            <div className="px-5 py-3 flex items-center gap-2 bg-[var(--brand)]/5">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand)]" />
              <span className="text-[11px] font-semibold uppercase tracking-widest text-[var(--brand)]">With FileVault</span>
            </div>
          </div>

          {ROWS.map((row, i) => (
            <div
              key={i}
              className="grid grid-cols-2 border-b border-[var(--border)] last:border-b-0 hover:bg-white/[0.02] transition-colors"
            >
              <div className="px-5 py-4 border-r border-[var(--border)] flex items-start gap-2.5">
                <svg className="h-3.5 w-3.5 text-[var(--destructive)] mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="text-sm text-[var(--muted-foreground)] leading-relaxed">{row.without}</span>
              </div>
              <div className="px-5 py-4 flex items-start gap-2.5 bg-[var(--brand)]/[0.03]">
                <svg className="h-3.5 w-3.5 text-[var(--brand)] mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-[var(--foreground)] leading-relaxed">{row.with}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
