import type { ExpiryOption } from '@/lib/validations'

export type Tier = 'anon' | 'free' | 'pro'

export interface TierLimits {
  maxBytes: number
  maxLinks: number | null
  maxExpiryOption: ExpiryOption
  dailyAnonLimit: number | null
  passwordAllowed: boolean
  customSlugAllowed: boolean
  label: string
}

const LIMITS: Record<Tier, TierLimits> = {
  anon: {
    maxBytes: 5 * 1024 * 1024,
    maxLinks: null,
    maxExpiryOption: '24h',
    dailyAnonLimit: 3,
    passwordAllowed: false,
    customSlugAllowed: false,
    label: '5 MB max · Sign in for more',
  },
  free: {
    maxBytes: 10 * 1024 * 1024,
    maxLinks: 10,
    maxExpiryOption: '30d',
    dailyAnonLimit: null,
    passwordAllowed: true,
    customSlugAllowed: true,
    label: '10 MB max · 10 link limit',
  },
  pro: {
    maxBytes: 100 * 1024 * 1024,
    maxLinks: null,
    maxExpiryOption: 'never',
    dailyAnonLimit: null,
    passwordAllowed: true,
    customSlugAllowed: true,
    label: '100 MB max · Unlimited links',
  },
}

export function getTier(userId: string | null, isPro: boolean): Tier {
  if (!userId) return 'anon'
  if (isPro) return 'pro'
  return 'free'
}

export function getLimits(tier: Tier): TierLimits {
  return LIMITS[tier]
}

// Returns the expiry capped to the tier's max. If the requested expiry exceeds
// the max allowed, silently downgrades (server enforces this too).
const EXPIRY_ORDER: ExpiryOption[] = ['1h', '24h', '7d', '30d', 'never']

export function capExpiry(expiry: ExpiryOption, maxExpiry: ExpiryOption): ExpiryOption {
  const idx = EXPIRY_ORDER.indexOf(expiry)
  const maxIdx = EXPIRY_ORDER.indexOf(maxExpiry)
  return idx <= maxIdx ? expiry : maxExpiry
}

export function isExpiryAllowed(expiry: ExpiryOption, maxExpiry: ExpiryOption): boolean {
  return EXPIRY_ORDER.indexOf(expiry) <= EXPIRY_ORDER.indexOf(maxExpiry)
}
