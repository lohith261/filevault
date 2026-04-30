'use client'

import { QRCodeSVG } from 'qrcode.react'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { useState } from 'react'

interface QRCodeDisplayProps {
  url: string
  inline?: boolean
}

function QRDialogContent({ url }: { url: string }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="rounded-xl border border-[var(--border)] bg-white p-4">
        <QRCodeSVG value={url} size={200} bgColor="#ffffff" fgColor="#09090b" level="M" />
      </div>
      <p className="text-sm text-[var(--muted-foreground)] break-all text-center">{url}</p>
    </div>
  )
}

export function QRCodeDisplay({ url, inline = false }: QRCodeDisplayProps) {
  const [open, setOpen] = useState(false)

  if (inline) {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="rounded-xl border border-[var(--border)] bg-white p-4">
          <QRCodeSVG value={url} size={160} bgColor="#ffffff" fgColor="#09090b" level="M" />
        </div>
      </div>
    )
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg p-2 text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
        title="Show QR code"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
        </svg>
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} title="QR Code">
        <QRDialogContent url={url} />
        <div className="mt-4 flex justify-end">
          <Button variant="secondary" onClick={() => setOpen(false)}>Close</Button>
        </div>
      </Dialog>
    </>
  )
}
