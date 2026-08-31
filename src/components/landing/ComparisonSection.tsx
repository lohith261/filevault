import Link from 'next/link'

export function ComparisonSection() {
  return (
    <section className="border-t border-[#e8e8e8] px-6 py-32 text-center">
      <div className="mx-auto max-w-2xl">
        <h2
          className="text-[clamp(2rem,5vw,3.75rem)] leading-[1.08] tracking-[-0.025em] text-[#0a0a0a] mb-5"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          Your AI is only as good as<br />
          what it can <em>remember.</em>
        </h2>
        <p className="text-[16px] font-light text-[#888] max-w-sm mx-auto mb-10 leading-relaxed">
          Give it a memory. Set up FileVault in minutes and see the difference.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link
            href="/agents"
            className="inline-flex items-center rounded-md bg-[#0a0a0a] text-white px-7 py-3.5 text-[15px] font-medium hover:bg-[#333] transition-colors"
          >
            Get started free
          </Link>
          <Link
            href="/pricing"
            className="inline-flex items-center rounded-md border border-[#d4d4d4] text-[#0a0a0a] px-7 py-3.5 text-[15px] font-medium hover:border-[#0a0a0a] transition-colors"
          >
            View pricing
          </Link>
        </div>
        <p className="mt-6 text-[12px] text-[#aaa]">
          Free to start &nbsp;·&nbsp; No credit card &nbsp;·&nbsp; Works with Claude, GPT-4, Gemini, and more
        </p>
      </div>
    </section>
  )
}
