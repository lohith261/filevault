'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@clerk/nextjs'
import { DropZone } from '@/components/upload/DropZone'
import { UploadProgress } from '@/components/upload/UploadProgress'
import { UploadSuccess } from '@/components/upload/UploadSuccess'
import { ExpiryPicker } from '@/components/upload/ExpiryPicker'
import { Input } from '@/components/ui/Input'
import { useUpload } from '@/hooks/useUpload'
import { getTier, getLimits } from '@/lib/limits'
import { validateCustomSlug } from '@/lib/slug'

const ROTATING_WORDS = ['HTML sites', 'static apps', 'landing pages', 'portfolios', 'demos']

function RotatingWord() {
  const [index, setIndex] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  if (!mounted) {
    return <span className="text-[var(--primary)]">{ROTATING_WORDS[0]}</span>
  }

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={index}
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -16, opacity: 0 }}
        transition={{ duration: 0.25 }}
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
  const tier = getTier(isSignedIn ? 'signed-in' : null, isPro)
  const limits = getLimits(tier)
  const { state, upload, reset } = useUpload()

  const [expiry, setExpiry] = useState('24h')
  const [password, setPassword] = useState('')
  const [customSlug, setCustomSlug] = useState('')
  const [slugError, setSlugError] = useState<string | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleSlugChange = (val: string) => {
    const clean = val.toLowerCase().replace(/[^a-z0-9-]/g, '')
    setCustomSlug(clean)
    setSlugError(clean ? (validateCustomSlug(clean) ?? null) : null)
  }

  const handleFileSelected = (file: File) => {
    if (customSlug && slugError) return
    setUploadError(null)
    upload(file, {
      expiry,
      password: password || undefined,
      slug: customSlug || undefined,
    })
  }

  const isActive = state.status === 'uploading' || state.status === 'processing'

  return (
    <section className="hero-glow relative min-h-screen flex items-center px-6 pt-28 pb-16">
      <div className="mx-auto max-w-6xl w-full grid lg:grid-cols-[1fr_460px] gap-12 lg:gap-20 items-center">

        {/* Left — headline */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--primary)] mb-5">
            Instant static hosting
          </p>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight text-[var(--foreground)]">
            Host your{' '}
            <RotatingWord />.{' '}
            <span className="text-[var(--primary)]">Instantly.</span>
          </h1>
          <p className="mt-6 text-lg text-[var(--muted-foreground)] max-w-[420px] leading-relaxed">
            Drop a ZIP or HTML file. Get a shareable link in seconds. No account needed.
          </p>
          <p className="mt-6 flex items-center gap-3 text-sm text-[var(--muted-foreground)]">
            <span className="flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5 text-[var(--success)]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              No build step
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5 text-[var(--success)]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              No config
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5 text-[var(--success)]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Free to start
            </span>
          </p>
        </motion.div>

        {/* Right — upload card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-xl shadow-black/[0.06]"
        >
          <AnimatePresence mode="wait">
            {state.status === 'success' ? (
              <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6">
                <UploadSuccess result={state.result} onReset={reset} />
              </motion.div>
            ) : isActive ? (
              <motion.div key="progress" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6">
                <UploadProgress
                  progress={'progress' in state ? (state as { progress: number }).progress : 92}
                  stage={state.status === 'uploading' ? 'uploading' : 'processing'}
                />
              </motion.div>
            ) : (
              <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {/* Options toggle */}
                <div className="border-b border-[var(--border)] px-5 py-3">
                  <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex w-full items-center justify-between text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                  >
                    <span>Options</span>
                    <div className="flex items-center gap-1">
                      <span className="rounded bg-[var(--muted)] px-1.5 py-0.5 font-mono text-[10px]">
                        {expiry}
                      </span>
                      {password && (
                        <span className="rounded bg-[var(--muted)] px-1.5 py-0.5 text-[10px]">🔒</span>
                      )}
                      <svg
                        className={`h-3 w-3 transition-transform duration-200 ml-0.5 ${showAdvanced ? 'rotate-180' : ''}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
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
                        <div className="space-y-4 pt-4">
                          <ExpiryPicker value={expiry} onChange={setExpiry} isPro={isPro} maxExpiry={limits.maxExpiryOption} />
                          <Input
                            type="password"
                            label="Password protection (optional)"
                            placeholder="Leave empty for public access"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                          />
                          {limits.customSlugAllowed ? (
                            <div className="flex flex-col gap-1.5">
                              <label className="text-sm font-medium text-[var(--muted-foreground)]">
                                Custom link name <span className="text-xs">(optional)</span>
                              </label>
                              <div className="flex items-center rounded border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm focus-within:border-[var(--primary)] transition-colors">
                                <input
                                  type="text"
                                  value={customSlug}
                                  onChange={(e) => handleSlugChange(e.target.value)}
                                  placeholder="my-project"
                                  maxLength={30}
                                  className="min-w-0 flex-1 bg-transparent font-mono text-[var(--foreground)] outline-none placeholder:text-[var(--muted-foreground)]"
                                />
                                <span className="ml-1 shrink-0 text-xs text-[var(--muted-foreground)]">.filevault.host</span>
                              </div>
                              {slugError && (
                                <p className="text-xs text-[var(--destructive)]">{slugError}</p>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 rounded border border-dashed border-[var(--border)] px-3 py-2.5">
                              <span className="text-xs text-[var(--muted-foreground)]">Custom link (e.g. <span className="font-mono">myproject.filevault.host</span>)</span>
                              <span className="ml-auto rounded-full bg-[var(--primary)]/10 px-2 py-0.5 text-xs font-semibold text-[var(--primary)]">Sign in</span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Drop zone */}
                <div className="p-5">
                  <DropZone
                    onFileSelected={handleFileSelected}
                    onReject={(msg) => setUploadError(msg)}
                    disabled={isActive}
                    maxBytes={limits.maxBytes}
                  />

                  {(uploadError || state.status === 'error') && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 text-center text-sm text-[var(--destructive)]"
                    >
                      {uploadError ?? (state.status === 'error' ? state.message : '')}
                    </motion.p>
                  )}

                  <p className="mt-3 text-center text-xs text-[var(--muted-foreground)]">
                    {limits.label} · Any file type
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

      </div>
    </section>
  )
}
