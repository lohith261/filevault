const FEATURES = [
  {
    num: '01',
    title: 'Store any file',
    description:
      'Upload documents, PDFs, or any text. Your agent can read, search, and reference them at any time — automatically.',
  },
  {
    num: '02',
    title: 'Remember across sessions',
    description:
      'Store facts, preferences, and context that carry over between conversations. Your AI stays informed.',
  },
  {
    num: '03',
    title: 'Search in plain English',
    description:
      'Ask a question, get the right answer. FileVault understands meaning, not just keywords.',
  },
  {
    num: '04',
    title: 'Organise by project',
    description:
      "Group files into collections. Keep one client's documents separate from another's — searches stay focused.",
  },
  {
    num: '05',
    title: 'Share between agents',
    description:
      'Let multiple AI agents access the same knowledge base. No duplicating files, no sharing passwords.',
  },
  {
    num: '06',
    title: 'Get notified instantly',
    description:
      'Know the moment a file is uploaded, processed, or deleted. Set a webhook URL and your workflow reacts in real time.',
  },
]

export function FeaturesSection() {
  return (
    <section className="border-t border-[#e8e8e8] px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-14">
          <span className="block text-[11px] font-medium tracking-[0.1em] uppercase text-[#888] mb-4">
            What it does
          </span>
          <h2
            className="text-[clamp(1.75rem,4vw,3rem)] leading-[1.1] tracking-[-0.025em] text-[#0a0a0a]"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Everything an AI agent<br />
            needs to <em>work well.</em>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border border-[#e8e8e8] rounded-lg overflow-hidden">
          {FEATURES.map((f, i) => (
            <div
              key={f.num}
              className={`p-8 border-[#e8e8e8] hover:bg-[#f9f9f9] transition-colors
                ${i % 3 !== 2 ? 'lg:border-r' : ''}
                ${i % 2 !== 1 ? 'sm:border-r lg:border-r-0' : ''}
                ${i < 3 ? 'sm:border-b' : ''}
                ${i < 4 ? 'lg:border-b' : ''}
              `}
            >
              <span className="block text-[11px] font-medium text-[#ccc] tracking-[0.06em] mb-6">{f.num}</span>
              <h3 className="text-[15px] font-semibold text-[#0a0a0a] mb-2 tracking-[-0.01em]">{f.title}</h3>
              <p className="text-[13.5px] text-[#888] leading-relaxed font-light">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
