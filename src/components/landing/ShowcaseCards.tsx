// Server component — no framer-motion, no client JS needed.

const SHOWCASES = [
  {
    title: 'Research Agent',
    endpoint: 'POST /v1/search',
    description: 'Ingest 100+ papers, query across them in natural language.',
  },
  {
    title: 'Customer Support',
    endpoint: 'POST /v1/memory',
    description: 'Remember customer preferences and prior issues across sessions.',
  },
  {
    title: 'Multi-Agent Team',
    endpoint: 'POST /v1/shares',
    description: 'Three agents share a knowledge base without sharing API keys.',
  },
]

export function ShowcaseCards() {
  return (
    <section className="py-20 px-6 border-t border-[var(--border)]">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 animate-fade-in-up">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] tracking-tight">
            Built for real agents.
          </h2>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">Three patterns that ship in an afternoon.</p>
        </div>

        <div className="divide-y divide-[var(--border)] border-t border-[var(--border)]">
          {SHOWCASES.map((item, i) => (
            <div
              key={item.title}
              className="py-5 grid grid-cols-12 gap-4 items-center animate-fade-in-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="col-span-12 sm:col-span-3">
                <h3 className="text-sm font-semibold text-[var(--foreground)]">
                  {item.title}
                </h3>
              </div>
              <div className="col-span-12 sm:col-span-4">
                <code className="text-[11px] font-mono text-[var(--brand)]">
                  {item.endpoint}
                </code>
              </div>
              <div className="col-span-12 sm:col-span-5">
                <p className="text-sm text-[var(--muted-foreground)]">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
