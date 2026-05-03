'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@clerk/nextjs'
import { FileGrid } from '@/components/dashboard/FileGrid'
import { StatsBar } from '@/components/dashboard/StatsBar'
import { Input } from '@/components/ui/Input'
import { useFiles } from '@/hooks/useFiles'

function useSafeAuth() {
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { has } = useAuth()
    return { has }
  } catch {
    return { has: undefined }
  }
}

export default function DashboardPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const { sites, total, isLoading, deleteFile, renameFile, updateFile, setCustomDomain } = useFiles(page, search)
  const { has } = useSafeAuth()
  const isPro = has?.({ plan: 'user:pro' }) ?? false

  const totalPages = Math.ceil(total / 20)

  return (
    <div className="mx-auto max-w-6xl px-4 pt-24 pb-16">
      {!isPro && (
        <Link href="/pricing" className="mb-6 flex items-center justify-between gap-3 rounded-xl border border-[var(--primary)]/30 bg-[var(--primary)]/5 px-4 py-3 hover:bg-[var(--primary)]/10 transition-colors">
          <div className="flex items-center gap-3">
            <span className="text-lg">✦</span>
            <div>
              <p className="text-sm font-semibold text-[var(--foreground)]">Upgrade to Pro</p>
              <p className="text-xs text-[var(--muted-foreground)]">50MB uploads · longer expiry · more power</p>
            </div>
          </div>
          <span className="shrink-0 rounded-lg bg-[var(--primary)] px-3 py-1.5 text-xs font-semibold text-white">
            See plans →
          </span>
        </Link>
      )}

      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">My deployments</h1>
        <div className="w-full sm:w-72">
          <Input
            placeholder="Search by name..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
      </div>

      <StatsBar sites={sites} total={total} />

      <FileGrid
        sites={sites}
        isLoading={isLoading}
        onDelete={deleteFile}
        onRename={renameFile}
        onUpdate={updateFile}
        onSetDomain={setCustomDomain}
        isPro={isPro}
      />

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`h-8 w-8 rounded-lg text-sm font-medium transition-colors ${
                p === page
                  ? 'bg-[var(--primary)] text-white'
                  : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)]'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
