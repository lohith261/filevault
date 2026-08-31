const STEPS = [
  {
    num: '1',
    title: 'Create an agent',
    description:
      'Sign up and create an agent profile. You get a single API key — that\'s all your AI needs to connect to FileVault.',
  },
  {
    num: '2',
    title: 'Upload your files',
    description:
      'Upload documents through the dashboard or directly through your AI. FileVault reads them and makes them searchable automatically.',
  },
  {
    num: '3',
    title: 'Your AI finds what it needs',
    description:
      'When your AI needs information, it asks FileVault. It gets back the right answer instantly — no matter how many files you have.',
  },
]

export function HowItWorksSection() {
  return (
    <section className="bg-[#f9f9f9] border-t border-b border-[#e8e8e8] px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-14">
          <span className="block text-[11px] font-medium tracking-[0.1em] uppercase text-[#888] mb-4">
            How it works
          </span>
          <h2
            className="text-[clamp(1.75rem,4vw,3rem)] leading-[1.1] tracking-[-0.025em] text-[#0a0a0a]"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Up and running<br />
            in <em>minutes.</em>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-12">
          {STEPS.map((step) => (
            <div key={step.num}>
              <span
                className="block text-[3rem] leading-none tracking-[-0.03em] text-[#e8e8e8] mb-5"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                {step.num}
              </span>
              <h3 className="text-[15px] font-semibold text-[#0a0a0a] mb-2 tracking-[-0.01em]">{step.title}</h3>
              <p className="text-[13.5px] text-[#888] leading-relaxed font-light">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
