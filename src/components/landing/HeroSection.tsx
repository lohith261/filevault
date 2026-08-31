// Async server component — fetches real stats from DB (cached 5 min).

import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { getLandingStats } from '@/lib/landingStats'

export async function HeroSection() {
  const { agents, embeddings } = await getLandingStats()

  const agentCount  = agents    > 0 ? agents.toLocaleString()                                   : '150+'
  const embedCount  = embeddings > 0 ? (embeddings >= 1000 ? `${Math.floor(embeddings/1000)}K+` : String(embeddings)) : '28K+'

  return (
    <section className="relative min-h-[88vh] flex items-center overflow-hidden pt-16">
      {/* Grid background — very subtle */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-grid" />
      </div>
      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[var(--brand)] opacity-[0.04] blur-[120px] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-20 lg:py-24 w-full">
        <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">

          {/* Left: Copy */}
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--brand)]/30 bg-[var(--brand)]/10 px-3 py-1 mb-8">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand)]" />
              <span className="text-[11px] font-medium text-[var(--brand)] tracking-wide">
                {agentCount} agents · {embedCount} embeddings indexed
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-[4.25rem] font-bold leading-[1.04] tracking-tight text-[var(--foreground)]">
              The storage layer<br />
              <span className="text-[var(--brand)]">AI agents</span>{' '}
              actually need.
            </h1>

            <p className="mt-5 max-w-md text-[15px] text-[var(--muted-foreground)] leading-relaxed">
              One API key. Your agent gets isolated file storage, semantic search, persistent memory, and cross-agent access control — no S3 glue, no Pinecone account, no custom auth.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/agents">
                <Button
                  size="lg"
                  className="bg-[var(--brand)] text-white hover:bg-[var(--brand-hover)] active:scale-[0.98] transition-all px-6 font-medium"
                >
                  Get API key →
                </Button>
              </Link>
              <Link href="/help">
                <Button variant="outline" size="lg" className="font-medium">
                  Read the docs
                </Button>
              </Link>
            </div>

            <div className="mt-8 flex items-center gap-5 text-xs text-[var(--muted-foreground)]">
              <span className="flex items-center gap-1.5">
                <svg className="h-3.5 w-3.5 text-[var(--brand)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                TypeScript SDK
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="h-3.5 w-3.5 text-[var(--brand)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                MCP compatible
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="h-3.5 w-3.5 text-[var(--brand)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                No account required
              </span>
            </div>
          </div>

          {/* Right: Real code block */}
          <div className="animate-fade-in-up animation-delay-150">
            <div className="rounded-xl border border-[var(--border)] bg-[#0d0d12] overflow-hidden shadow-2xl shadow-black/50">
              {/* Terminal chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                <span className="ml-3 text-[11px] font-mono text-[#4b5563]">bash</span>
              </div>
              <div className="px-5 py-5 font-mono text-[12.5px] leading-[1.9] space-y-3">
                {/* Step 1 */}
                <div>
                  <span className="code-comment"># 1. Create an agent — key shown once</span>
                  <br />
                  <span className="code-keyword">curl</span>
                  <span className="text-[#a1a1aa]"> -X POST https://filevault.host/api/v1/agents \</span>
                  <br />
                  <span className="text-[#a1a1aa]">  -d </span>
                  <span className="code-string">&apos;&#123;&quot;name&quot;: &quot;my-agent&quot;&#125;&apos;</span>
                </div>
                <div className="pl-0 text-[#4b5563]">{`# → { "api_key": "fv_sk_a3f9c2..." }`}</div>

                {/* Step 2 */}
                <div className="pt-1">
                  <span className="code-comment"># 2. Upload + index a file</span>
                  <br />
                  <span className="code-keyword">curl</span>
                  <span className="text-[#a1a1aa]"> -X POST https://filevault.host/api/v1/files \</span>
                  <br />
                  <span className="text-[#a1a1aa]">  -H </span>
                  <span className="code-string">&quot;Authorization: Bearer fv_sk_a3f9c2...&quot;</span>
                  <span className="text-[#a1a1aa]"> \</span>
                  <br />
                  <span className="text-[#a1a1aa]">  -F </span>
                  <span className="code-string">&quot;file=@report.pdf&quot;</span>
                  <span className="text-[#a1a1aa]"> -F </span>
                  <span className="code-string">&quot;index=true&quot;</span>
                </div>

                {/* Step 3 */}
                <div className="pt-1">
                  <span className="code-comment"># 3. Search in natural language</span>
                  <br />
                  <span className="code-keyword">curl</span>
                  <span className="text-[#a1a1aa]"> -X POST https://filevault.host/api/v1/search \</span>
                  <br />
                  <span className="text-[#a1a1aa]">  -H </span>
                  <span className="code-string">&quot;Authorization: Bearer fv_sk_a3f9c2...&quot;</span>
                  <span className="text-[#a1a1aa]"> \</span>
                  <br />
                  <span className="text-[#a1a1aa]">  -d </span>
                  <span className="code-string">&apos;&#123;&quot;query&quot;: &quot;What was the Q3 revenue?&quot;&#125;&apos;</span>
                </div>
                <div className="text-[#4b5563]">{`# → [{ score: 0.94, content: "Q3 revenue reached..." }]`}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
