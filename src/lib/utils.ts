import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatBytes(bytes: number | bigint): string {
  const n = typeof bytes === 'bigint' ? Number(bytes) : bytes
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}

export function formatRelativeTime(date: Date | string): string {
  const d = new Date(date)
  const now = new Date()
  const diff = d.getTime() - now.getTime()
  const absDiff = Math.abs(diff)
  const past = diff < 0

  if (absDiff < 60_000) return past ? 'just now' : 'in a moment'
  if (absDiff < 3_600_000) {
    const mins = Math.floor(absDiff / 60_000)
    return past ? `${mins}m ago` : `in ${mins}m`
  }
  if (absDiff < 86_400_000) {
    const hours = Math.floor(absDiff / 3_600_000)
    return past ? `${hours}h ago` : `in ${hours}h`
  }
  const days = Math.floor(absDiff / 86_400_000)
  return past ? `${days}d ago` : `in ${days}d`
}
