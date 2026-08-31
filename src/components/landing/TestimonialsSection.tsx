// Server component — no framer-motion, no client JS needed.

const TESTIMONIALS = [
  {
    quote: 'We replaced S3 + Pinecone + a custom auth layer with FileVault in a single afternoon. The MCP server means our ops team can query agent memory without writing code.',
    author: 'Hemanth A',
    org: 'AI Engineer, Cognizant',
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-24 px-6 border-t border-[var(--border)]">
      <div className="mx-auto max-w-4xl animate-fade-in-up">
        {TESTIMONIALS.map((t) => (
          <div key={t.author} className="space-y-6">
            <blockquote className="text-xl sm:text-2xl font-medium text-[var(--foreground)] leading-snug tracking-tight">
              &ldquo;{t.quote}&rdquo;
            </blockquote>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-sm bg-[var(--muted)] flex items-center justify-center">
                <span className="text-xs font-mono text-[var(--muted-foreground)]">
                  {t.author.charAt(0)}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">{t.author}</p>
                <p className="text-[11px] font-mono text-[var(--muted-foreground)]">{t.org}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
