import Link from 'next/link'
import { getLandingStats } from '@/lib/landingStats'

export async function HeroSection() {
  const { agents, embeddings } = await getLandingStats()
  const agentCount = agents > 0 ? agents.toLocaleString() : '150+'
  const embedCount = embeddings > 0 ? (embeddings >= 1000 ? `${Math.floor(embeddings / 1000)}K+` : String(embeddings)) : '28K+'

  return (
    <section className="pt-40 pb-28 px-6 text-center">
      <div className="mx-auto max-w-4xl">
        <span className="inline-block text-[11px] font-medium tracking-[0.1em] uppercase text-[#888] mb-10">
          Storage for AI agents
        </span>

        <h1
          className="text-[clamp(3rem,7vw,5.5rem)] leading-[1.05] tracking-[-0.025em] text-[#0a0a0a] mb-7"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          Give your AI<br />
          a <em>memory.</em>
        </h1>

        <p className="text-lg font-light text-[#888] max-w-[500px] mx-auto mb-10 leading-relaxed">
          FileVault gives AI agents their own place to store files, remember things, and find information — without you writing any extra code.
        </p>

        <div className="flex items-center justify-center gap-3 flex-wrap mb-14">
          <Link
            href="/agents"
            className="inline-flex items-center rounded-md bg-[#0a0a0a] text-white px-6 py-3 text-[15px] font-medium hover:bg-[#333] transition-colors"
          >
            Get started free
          </Link>
          <Link
            href="/help"
            className="inline-flex items-center rounded-md border border-[#d4d4d4] text-[#0a0a0a] px-6 py-3 text-[15px] font-medium hover:border-[#0a0a0a] transition-colors"
          >
            See how it works
          </Link>
        </div>

        <p className="text-xs text-[#aaa]">
          No credit card required &nbsp;·&nbsp; Free to start &nbsp;·&nbsp; Works with any AI
        </p>
      </div>

      {/* Stats */}
      <div className="mx-auto max-w-3xl mt-20 grid grid-cols-2 sm:grid-cols-4 border border-[#e8e8e8] rounded-lg overflow-hidden">
        {[
          { num: agentCount, label: 'Agents using FileVault' },
          { num: embedCount, label: 'Documents indexed' },
          { num: '<50ms', label: 'Time to find anything' },
          { num: '1', label: 'API key to set it up' },
        ].map((s, i) => (
          <div
            key={s.label}
            className={`py-6 px-4 text-center ${i < 3 ? 'border-r border-[#e8e8e8]' : ''} ${i >= 2 ? 'hidden sm:block' : ''}`}
          >
            <span
              className="block text-[2rem] leading-none tracking-[-0.03em] text-[#0a0a0a] mb-1"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              {s.num}
            </span>
            <span className="text-[11.5px] text-[#888]">{s.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
