import { z } from 'zod'

export const EXPIRY_OPTIONS = ['1h', '24h', '7d', '30d', 'never'] as const
export type ExpiryOption = (typeof EXPIRY_OPTIONS)[number]

export function expiryToDate(expiry: ExpiryOption): Date | null {
  if (expiry === 'never') return null
  const now = new Date()
  switch (expiry) {
    case '1h': return new Date(now.getTime() + 1 * 60 * 60 * 1000)
    case '24h': return new Date(now.getTime() + 24 * 60 * 60 * 1000)
    case '7d': return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    case '30d': return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
  }
}

export const UpdateSiteSchema = z.object({
  label: z.string().max(100).optional(),
  password: z.string().max(100).nullable().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
})

export const ALLOWED_SINGLE_MIME_TYPES = new Set([
  'text/html',
  'text/css',
  'application/javascript',
  'text/javascript',
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'application/json',
])

// Max upload size for Pro tier (hard ceiling used by multipart middleware)
export const MAX_UPLOAD_SIZE = 100 * 1024 * 1024
