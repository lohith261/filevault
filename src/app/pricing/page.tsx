'use client'

import { PricingTable } from '@clerk/nextjs'
import { useTheme } from 'next-themes'

export default function PricingPage() {
  const { resolvedTheme } = useTheme()

  return (
    <div className="mx-auto max-w-4xl px-4 pt-28 pb-20">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-[var(--foreground)]">Simple pricing</h1>
        <p className="mt-3 text-[var(--muted-foreground)]">
          Start free. Upgrade when you need more power.
        </p>
      </div>
      <PricingTable
        appearance={{
          variables: {
            colorPrimary: '#7c3aed',
            colorBackground: resolvedTheme === 'dark' ? '#09090b' : '#ffffff',
            colorText: resolvedTheme === 'dark' ? '#fafafa' : '#09090b',
            colorTextSecondary: resolvedTheme === 'dark' ? '#a1a1aa' : '#71717a',
            borderRadius: '0.75rem',
          },
        }}
      />
    </div>
  )
}
