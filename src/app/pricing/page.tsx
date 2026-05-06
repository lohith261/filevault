'use client'

import Link from 'next/link'

function Check() {
  return (
    <svg className="h-4 w-4 shrink-0 text-[var(--success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}

function Cross() {
  return (
    <svg className="h-4 w-4 shrink-0 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

const plans = [
  {
    name: 'Free',
    price: 'Free',
    description: 'Everything you need to build and ship an agent in production.',
    features: [
      { label: '1,000 files per agent', included: true },
      { label: '1 GB storage', included: true },
      { label: '5,000 memories', included: true },
      { label: 'Semantic search (pgvector)', included: true },
      { label: 'File indexing & chunking', included: true },
      { label: 'Collections & sharing', included: true },
      { label: 'Webhooks', included: true },
      { label: 'REST API + TypeScript SDK', included: true },
      { label: 'Priority support', included: false },
      { label: 'Higher rate limits', included: false },
    ],
    cta: 'Get your API key',
    ctaHref: '/agents',
    highlight: false,
  },
  {
    name: 'Pro',
    price: 'Coming soon',
    description: 'For teams running agents at scale with higher throughput and SLA guarantees.',
    features: [
      { label: 'Unlimited files', included: true },
      { label: '50 GB storage', included: true },
      { label: 'Unlimited memories', included: true },
      { label: 'Semantic search (pgvector)', included: true },
      { label: 'File indexing & chunking', included: true },
      { label: 'Collections & sharing', included: true },
      { label: 'Webhooks', included: true },
      { label: 'REST API + TypeScript SDK', included: true },
      { label: 'Priority support', included: true },
      { label: 'Higher rate limits', included: true },
    ],
    cta: 'Join waitlist',
    ctaHref: 'mailto:support@filevault.host?subject=Pro waitlist',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'Custom limits, dedicated infrastructure, and SLA for large deployments.',
    features: [
      { label: 'Custom file & storage limits', included: true },
      { label: 'Custom memory limits', included: true },
      { label: 'Dedicated infrastructure', included: true },
      { label: 'Semantic search (pgvector)', included: true },
      { label: 'File indexing & chunking', included: true },
      { label: 'Collections & sharing', included: true },
      { label: 'Webhooks', included: true },
      { label: 'REST API + TypeScript SDK', included: true },
      { label: 'Dedicated support + SLA', included: true },
      { label: 'Custom rate limits', included: true },
    ],
    cta: 'Contact us',
    ctaHref: 'mailto:support@filevault.host?subject=Enterprise inquiry',
    highlight: false,
  },
]

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 pt-28 pb-24">
      {/* Header */}
      <div className="mb-14 text-center">
        <p className="text-[11px] font-mono uppercase tracking-[0.15em] text-[var(--muted-foreground)] mb-3">
          Pricing
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-[var(--foreground)]">
          Storage infrastructure for AI agents
        </h1>
        <p className="mt-3 text-[var(--muted-foreground)] max-w-xl mx-auto">
          Start free. One API key gives your agent files, memory, and semantic search — no infrastructure to manage.
        </p>
      </div>

      {/* Cards */}
      <div className="grid gap-6 sm:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative flex flex-col rounded-2xl border p-6 ${
              plan.highlight
                ? 'border-[var(--primary)] shadow-lg shadow-[var(--primary)]/10'
                : 'border-[var(--border)]'
            } bg-[var(--card)]`}
          >
            {plan.highlight && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[var(--primary)] px-3 py-0.5 text-xs font-semibold text-white">
                Most popular
              </span>
            )}

            <div className="mb-6">
              <p className="text-sm font-medium text-[var(--muted-foreground)]">{plan.name}</p>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-[var(--foreground)]">{plan.price}</span>
              </div>
              <p className="mt-2 text-xs text-[var(--muted-foreground)] leading-relaxed">
                {plan.description}
              </p>
            </div>

            <ul className="mb-8 flex-1 space-y-2.5">
              {plan.features.map((f) => (
                <li key={f.label} className="flex items-center gap-2.5 text-sm">
                  {f.included ? <Check /> : <Cross />}
                  <span className={f.included ? 'text-[var(--foreground)]' : 'text-[var(--muted-foreground)] opacity-60'}>
                    {f.label}
                  </span>
                </li>
              ))}
            </ul>

            <Link
              href={plan.ctaHref}
              className={`block w-full rounded-lg py-2 text-center text-sm font-medium transition-opacity ${
                plan.highlight
                  ? 'bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90'
                  : 'border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)]'
              }`}
            >
              {plan.cta}
            </Link>
          </div>
        ))}
      </div>

      {/* Rate limits note */}
      <div className="mt-10 rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
        <p className="text-xs font-mono text-[var(--muted-foreground)] text-center">
          Free tier rate limit: <span className="text-[var(--foreground)]">20 uploads / minute</span> per agent &nbsp;·&nbsp;
          Max file size: <span className="text-[var(--foreground)]">50 MB</span> &nbsp;·&nbsp;
          All plans include the full API surface
        </p>
      </div>

      {/* FAQ */}
      <div className="mt-20">
        <h2 className="mb-8 text-center text-2xl font-semibold text-[var(--foreground)]">
          Common questions
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            {
              q: 'What is an agent?',
              a: 'An agent is an API identity — you create one and get a secret key (fv_sk_...). Each agent has its own isolated storage, memory, and search index.',
            },
            {
              q: 'How does semantic search work?',
              a: 'When you upload a file with index=true, FileVault extracts text, chunks it, and stores embeddings in pgvector. Search queries run cosine similarity against those embeddings.',
            },
            {
              q: 'What file types can be indexed?',
              a: 'HTML, plain text, PDF, and JSON files are extracted and indexed. All other file types are stored and retrievable but not semantically searchable.',
            },
            {
              q: 'What are memories?',
              a: 'Memories are arbitrary text snippets your agent stores with an embedding attached — useful for conversation history, facts, or any unstructured knowledge your agent wants to recall later.',
            },
            {
              q: 'Is there a TypeScript SDK?',
              a: 'Yes. Import the FileVault class from the SDK, pass your API key, and get typed methods for every API endpoint — upload, search, memory, collections, and more.',
            },
            {
              q: 'When does Pro launch?',
              a: 'We\'re targeting Pro in the coming weeks. Join the waitlist and you\'ll be first to know — and get early pricing.',
            },
          ].map(({ q, a }) => (
            <div key={q} className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
              <p className="text-sm font-semibold text-[var(--foreground)]">{q}</p>
              <p className="mt-1.5 text-sm text-[var(--muted-foreground)] leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-12 text-center text-xs text-[var(--muted-foreground)]">
        More questions?{' '}
        <Link href="/help" className="underline underline-offset-2 hover:text-[var(--foreground)]">
          Visit the help page
        </Link>
        {' '}or email{' '}
        <a href="mailto:support@filevault.host" className="underline underline-offset-2 hover:text-[var(--foreground)]">
          support@filevault.host
        </a>
      </p>
    </div>
  )
}
