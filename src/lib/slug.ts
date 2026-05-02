import { customAlphabet } from 'nanoid'

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 6)

export const generateSlug = (): string => nanoid()

const RESERVED = new Set([
  'www', 'api', 'app', 'admin', 'mail', 'smtp', 'ftp',
  'dashboard', 'login', 'signup', 'pricing', 'blog', 'help', 's',
])

const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$|^[a-z0-9]{2,30}$/

export function validateCustomSlug(slug: string): string | null {
  if (!SLUG_RE.test(slug)) {
    return 'Slug must be 3–30 characters, lowercase letters, numbers, and hyphens only.'
  }
  if (RESERVED.has(slug)) {
    return `"${slug}" is a reserved name.`
  }
  if (slug.includes('--')) {
    return 'Slug cannot contain consecutive hyphens.'
  }
  return null
}
