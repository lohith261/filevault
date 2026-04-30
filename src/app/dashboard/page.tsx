'use client'

import { useState } from 'react'
import { FileGrid } from '@/components/dashboard/FileGrid'
import { StatsBar } from '@/components/dashboard/StatsBar'
import { Input } from '@/components/ui/Input'
import { useFiles } from '@/hooks/useFiles'

export default function DashboardPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const { sites, total, isLoading, deleteFile, renameFile } = useFiles(page, search)

  const totalPages = Math.ceil(total / 20)

  return (
    <div className="mx-auto max-w-6xl px-4 pt-24 pb-16">
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
