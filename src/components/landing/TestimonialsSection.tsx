const TESTIMONIALS = [
  {
    quote: 'Before FileVault, our AI forgot everything between sessions. Now it feels like it actually knows our business.',
    author: 'Alex R.',
    role: 'Product lead',
  },
  {
    quote: 'I set it up in half an hour. My AI assistant now references documents from months ago without me doing anything.',
    author: 'Sam K.',
    role: 'Indie developer',
  },
  {
    quote: 'The search is genuinely impressive. I ask in plain English and it finds exactly what I meant, not just what I typed.',
    author: 'Hemanth A.',
    role: 'AI Engineer, Cognizant',
  },
]

export function TestimonialsSection() {
  return (
    <section className="border-t border-[#e8e8e8] px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-12">
          {TESTIMONIALS.map((t) => (
            <div key={t.author} className="flex flex-col gap-5">
              <span
                className="text-[2.5rem] leading-none text-[#d4d4d4]"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                "
              </span>
              <p
                className="text-[15px] text-[#444] leading-relaxed italic"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                {t.quote}
              </p>
              <div>
                <span className="block text-[13px] font-semibold text-[#0a0a0a]">{t.author}</span>
                <span className="block text-[12px] text-[#888]">{t.role}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
