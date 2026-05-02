'use client'

import Link from 'next/link'
import { useAuth, SignInButton } from '@clerk/nextjs'

const CLERK_CONFIGURED = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

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

function useSafeAuth() {
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { isSignedIn } = useAuth()
    return { isSignedIn: isSignedIn ?? false }
  } catch {
    return { isSignedIn: false }
  }
}

const plans = [
  {
    name: 'Anonymous',
    price: 'Free',
    description: 'No account needed. Just drop and share.',
    features: [
      { label: '5 MB file size limit', included: true },
      { label: 'Links expire in 24 hours', included: true },
      { label: 'Up to 3 uploads/day', included: true },
      { label: 'All file types', included: true },
      { label: 'Password protection', included: false },
      { label: 'Custom link name', included: false },
      { label: 'Unlimited links', included: false },
    ],
    cta: 'Upload now',
    ctaHref: '/',
    highlight: false,
  },
  {
    name: 'Free',
    price: 'Free',
    description: 'Sign up for more storage, password protection, and custom links.',
    features: [
      { label: '10 MB file size limit', included: true },
      { label: 'Links last 30 days', included: true },
      { label: 'Up to 10 active links', included: true },
      { label: 'All file types', included: true },
      { label: 'Password protection', included: true },
      { label: 'Custom link name', included: true },
      { label: 'Unlimited links', included: false },
    ],
    cta: 'Create free account',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '₹399',
    period: '/month',
    description: 'For developers, designers, and teams who ship constantly.',
    features: [
      { label: '100 MB file size limit', included: true },
      { label: 'Links never expire', included: true },
      { label: 'Unlimited links', included: true },
      { label: 'All file types', included: true },
      { label: 'Password protection', included: true },
      { label: 'Custom link name', included: true },
      { label: 'Priority support', included: true },
    ],
    cta: 'Get Pro',
    ctaHref: '/dashboard',
    highlight: true,
  },
]

export default function PricingPage() {
  const { isSignedIn } = useSafeAuth()

  return (
    <div className="mx-auto max-w-5xl px-4 pt-28 pb-24">
      {/* Header */}
      <div className="mb-14 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-[var(--foreground)]">
          Simple, honest pricing
        </h1>
        <p className="mt-3 text-[var(--muted-foreground)]">
          No surprise fees. Start free, upgrade when you need more.
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
                {plan.period && (
                  <span className="text-sm text-[var(--muted-foreground)]">{plan.period}</span>
                )}
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

            {plan.name === 'Anonymous' && (
              <Link
                href={plan.ctaHref!}
                className="block w-full rounded-lg border border-[var(--border)] py-2 text-center text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--muted)]"
              >
                {plan.cta}
              </Link>
            )}

            {plan.name === 'Free' && (
              isSignedIn ? (
                <Link
                  href="/dashboard"
                  className="block w-full rounded-lg border border-[var(--border)] py-2 text-center text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--muted)]"
                >
                  Go to dashboard
                </Link>
              ) : CLERK_CONFIGURED ? (
                <SignInButton mode="modal">
                  <button className="w-full rounded-lg border border-[var(--border)] py-2 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--muted)]">
                    {plan.cta}
                  </button>
                </SignInButton>
              ) : (
                <Link
                  href="/sign-up"
                  className="block w-full rounded-lg border border-[var(--border)] py-2 text-center text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--muted)]"
                >
                  {plan.cta}
                </Link>
              )
            )}

            {plan.name === 'Pro' && (
              <Link
                href={plan.ctaHref!}
                className="block w-full rounded-lg bg-[var(--primary)] py-2 text-center text-sm font-medium text-[var(--primary-foreground)] transition-opacity hover:opacity-90"
              >
                {plan.cta}
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div className="mt-20">
        <h2 className="mb-8 text-center text-2xl font-semibold text-[var(--foreground)]">
          Common questions
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            {
              q: 'Do I need an account to upload?',
              a: 'No. You can upload up to 5 MB files without an account. They expire after 24 hours.',
            },
            {
              q: 'What happens when a link expires?',
              a: 'The link stops working and the files are automatically deleted from storage.',
            },
            {
              q: 'Can I use a custom subdomain?',
              a: 'Yes — any signed-in user can choose a custom link name like myproject.filevault.host.',
            },
            {
              q: 'What file types are supported?',
              a: 'HTML files, ZIP archives (with HTML + assets), PDFs, images, and most static file types.',
            },
            {
              q: 'How does password protection work?',
              a: 'Set a password when uploading. Visitors see a prompt before they can view the content.',
            },
            {
              q: 'Can I cancel Pro at any time?',
              a: 'Yes. Cancel anytime from your dashboard. Links stay live until the billing period ends, then switch to 30-day expiry.',
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
