'use client'

import { cn } from '@/lib/utils'

const OPTIONS: { value: string; label: string; requiresAuth?: boolean }[] = [
  { value: '1h', label: '1 hour' },
  { value: '24h', label: '24 hours' },
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: 'never', label: 'Never', requiresAuth: true },
]

interface ExpiryPickerProps {
  value: string
  onChange: (value: string) => void
  isLoggedIn?: boolean
}

export function ExpiryPicker({ value, onChange, isLoggedIn = false }: ExpiryPickerProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-[var(--muted-foreground)]">Expires after</label>
      <div className="flex flex-wrap gap-2">
        {OPTIONS.map((opt) => {
          const disabled = opt.requiresAuth && !isLoggedIn
          return (
            <button
              key={opt.value}
              onClick={() => !disabled && onChange(opt.value)}
              disabled={disabled}
              className={cn(
                'rounded-lg border px-3 py-1.5 text-sm font-medium transition-all',
                value === opt.value
                  ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]'
                  : 'border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--muted-foreground)] hover:text-[var(--foreground)]',
                disabled && 'opacity-40 cursor-not-allowed'
              )}
              title={disabled ? 'Sign in to enable permanent hosting' : undefined}
            >
              {opt.label}
              {disabled && ' 🔒'}
            </button>
          )
        })}
      </div>
    </div>
  )
}
