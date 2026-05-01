'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@clerk/nextjs'
import { DropZone } from '@/components/upload/DropZone'
import { UploadProgress } from '@/components/upload/UploadProgress'
import { UploadSuccess } from '@/components/upload/UploadSuccess'
import { ExpiryPicker } from '@/components/upload/ExpiryPicker'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useUpload } from '@/hooks/useUpload'

const ROTATING_WORDS = ['HTML sites', 'static apps', 'landing pages', 'portfolios', 'demos']

function RotatingWord() {
  const [index, setIndex] = useState(0)

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={index}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -20, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="inline-block text-[var(--primary)]"
        onAnimationComplete={() => {
          setTimeout(() => setIndex((i) => (i + 1) % ROTATING_WORDS.length), 2500)
        }}
      >
        {ROTATING_WORDS[index]}
      </motion.span>
    </AnimatePresence>
  )
}

function useSafeAuth() {
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { isSignedIn, has } = useAuth()
    return { isSignedIn: isSignedIn ?? false, has }
  } catch {
    return { isSignedIn: false, has: undefined }
  }
}

export function HeroSection() {
  const { isSignedIn, has } = useSafeAuth()
  const isPro = isSignedIn ? (has?.({ plan: 'user:pro' }) ?? false) : false
  const { state, upload, reset } = useUpload()
  const [expiry, setExpiry] = useState('24h')
  const [password, setPassword] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileSelected = (file: File) => setSelectedFile(file)

  const handleUpload = () => {
    if (!selectedFile) return
    upload(selectedFile, { expiry, password: password || undefined })
  }

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 pt-20">
      {/* Animated gradient blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 left-1/4 h-[500px] w-[500px] rounded-full bg-violet-500/8 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute top-1/2 right-1/4 h-[350px] w-[350px] rounded-full bg-blue-500/6 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, 15, 0], y: [0, -15, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
          className="absolute bottom-1/4 left-1/3 h-[300px] w-[300px] rounded-full bg-violet-400/5 blur-3xl"
        />
      </div>

      <div className="relative w-full max-w-2xl mx-auto">
        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--muted)] px-3 py-1 text-xs font-medium text-[var(--muted-foreground)]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Free hosting, no account required
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-[var(--foreground)] leading-[1.1]">
            Host your <RotatingWord />
            <br />
            <span className="bg-gradient-to-r from-violet-500 to-blue-500 bg-clip-text text-transparent">
              in under 3 seconds.
            </span>
          </h1>
          <p className="mt-4 text-base text-[var(--muted-foreground)] max-w-md mx-auto">
            Drop a ZIP or HTML file. Get a shareable link instantly. No config. No account needed.
          </p>
          <div className="mt-5 flex items-center justify-center gap-5 text-xs text-[var(--muted-foreground)]">
            <span className="flex items-center gap-1.5">
              <span className="font-semibold text-[var(--foreground)]">10,000+</span> sites deployed
            </span>
            <span className="h-1 w-1 rounded-full bg-[var(--border)]" />
            <span className="flex items-center gap-1.5">
              <span className="font-semibold text-[var(--foreground)]">50 MB</span> max with Pro
            </span>
            <span className="h-1 w-1 rounded-full bg-[var(--border)]" />
            <span>No account needed</span>
          </div>
        </motion.div>

        {/* Upload card */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-xl shadow-black/5"
        >
          <AnimatePresence mode="wait">
            {state.status === 'success' ? (
              <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <UploadSuccess result={state.result} onReset={reset} />
              </motion.div>
            ) : state.status === 'uploading' || state.status === 'processing' ? (
              <motion.div key="progress" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-4">
                <UploadProgress
                  progress={'progress' in state ? (state as { progress: number }).progress : 95}
                  stage={state.status === 'uploading' ? 'uploading' : 'processing'}
                />
              </motion.div>
            ) : (
              <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <DropZone
                  onFileSelected={handleFileSelected}
                  disabled={false}
                />

                <ExpiryPicker value={expiry} onChange={setExpiry} isPro={isPro} />

                {/* Advanced options */}
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors flex items-center gap-1"
                >
                  <svg
                    className={`h-3 w-3 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  Advanced options
                </button>

                <AnimatePresence>
                  {showAdvanced && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <Input
                        type="password"
                        label="Password protection (optional)"
                        placeholder="Leave empty for public access"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {state.status === 'error' && (
                  <p className="text-sm text-[var(--destructive)]">{state.message}</p>
                )}

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleUpload}
                  disabled={!selectedFile}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Deploy now
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-4 text-center text-xs text-[var(--muted-foreground)]"
        >
          {isPro ? '50MB max' : '10MB max (free) · 50MB with Pro'} · ZIP or HTML · No account required
        </motion.p>
      </div>
    </section>
  )
}
