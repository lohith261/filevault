// Server component — no framer-motion, no client JS needed.

const FEATURES = [
  {
    num: '01',
    title: 'Semantic file storage',
    description:
      'Upload any file and automatically extract, chunk, and embed it for natural language search. PDFs, HTML, JSON, TXT — all become queryable.',
    tag: 'pgvector · 1536-dim',
  },
  {
    num: '02',
    title: 'Agent memory',
    description:
      'Persistent working memory with TTL support. Store preferences, facts, and context that survives across sessions.',
    tag: 'vector(1536) · TTL',
  },
  {
    num: '03',
    title: 'Agent-to-agent sharing',
    description:
      'Grant read access to your file embeddings to other agents. Build multi-agent systems that share knowledge, not credentials.',
    tag: 'Cross-agent ACL',
  },
  {
    num: '04',
    title: 'Collections & scoping',
    description:
      'Group files into named collections. Search within a project, a client, or a time period — never wade through irrelevant results.',
    tag: 'Metadata filtering',
  },
  {
    num: '05',
    title: 'Event-driven webhooks',
    description:
      'Register a URL and get notified when files are uploaded, indexed, or deleted. Build reactive agent workflows.',
    tag: 'Signed payloads',
  },
  {
    num: '06',
    title: 'MCP server',
    description:
      'Plug FileVault directly into Claude Desktop, Cursor, Cline, or any MCP-compatible client. No code required.',
    tag: 'stdio transport',
  },
]

export function FeaturesSection() {
  return (
    <section className="relative py-20 px-6 border-t border-[var(--border)]">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 animate-fade-in-up">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] tracking-tight">
            Everything an agent needs.
          </h2>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            Six primitives, one API key.
          </p>
        </div>

        <div className="divide-y divide-[var(--border)]">
          {FEATURES.map((feature) => (
            <div
              key={feature.num}
              className="py-5 grid grid-cols-12 gap-4 items-center group"
            >
              <div className="col-span-1">
                <span className="text-[11px] font-mono text-[var(--muted-foreground)]">
                  {feature.num}
                </span>
              </div>
              <div className="col-span-11 sm:col-span-3 lg:col-span-2">
                <h3 className="text-sm font-semibold text-[var(--foreground)]">
                  {feature.title}
                </h3>
              </div>
              <div className="col-span-11 col-start-2 sm:col-span-6 sm:col-start-auto lg:col-span-7">
                <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                  {feature.description}
                </p>
              </div>
              <div className="col-span-11 col-start-2 sm:col-span-2 sm:col-start-auto sm:text-right">
                <span className="text-[10px] font-mono text-[var(--muted-foreground)]">
                  {feature.tag}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
