'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { isExpiryAllowed } from '@/lib/limits'
import type { ExpiryOption } from '@/lib/validations'

const OPTIONS: { value: ExpiryOption; label: string }[] = [
  { value: '1h',    label: '1 hour' },
  { value: '24h',   label: '24 hours' },
  { value: '7d',    label: '7 days' },
  { value: '30d',   label: '30 days' },
  { value: 'never', label: 'Never' },
]

interface ExpiryPickerProps {
  value: string
  onChange: (value: string) => void
  isPro?: boolean
  maxExpiry?: ExpiryOption
}

export function ExpiryPicker({ value, onChange, isPro = false, maxExpiry = '24h' }: ExpiryPickerProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-[var(--muted-foreground)]">Expires after</label>
        {!isPro && (
          <Link
            href="/pricing"
            className="rounded-full bg-[var(--primary)]/10 px-2 py-0.5 text-xs font-semibold text-[var(--primary)] hover:bg-[var(--primary)]/20 transition-colors"
          >
            Upgrade for longer
          </Link>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {OPTIONS.map((opt) => {
          const locked = !isExpiryAllowed(opt.value, maxExpiry)
          return (
            <button
              key={opt.value}
              onClick={() => !locked && onChange(opt.value)}
              disabled={locked}
              className={cn(
                'relative rounded-lg border px-3 py-1.5 text-sm font-medium transition-all',
                value === opt.value
                  ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]'
                  : 'border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--muted-foreground)] hover:text-[var(--foreground)]',
                locked && 'cursor-not-allowed opacity-40'
              )}
              title={locked ? (isPro ? undefined : 'Pro plan required') : undefined}
            >
              {opt.label}
              {locked && !isPro && (
                <span className="ml-1 text-xs">✦</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
