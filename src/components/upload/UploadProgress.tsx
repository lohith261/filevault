'use client'

import { motion } from 'framer-motion'

interface UploadProgressProps {
  progress: number
  stage: 'uploading' | 'processing'
}

const STAGE_LABELS = {
  uploading: 'Uploading...',
  processing: 'Extracting & deploying...',
}

export function UploadProgress({ progress, stage }: UploadProgressProps) {
  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-[var(--foreground)]">{STAGE_LABELS[stage]}</span>
        {stage === 'uploading' && (
          <span className="text-[var(--muted-foreground)]">{progress}%</span>
        )}
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-[var(--primary)]"
          initial={{ width: 0 }}
          animate={{ width: stage === 'processing' ? '90%' : `${progress}%` }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        />
        {stage === 'processing' && (
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          />
        )}
      </div>
    </div>
  )
}
