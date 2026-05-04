'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { DropZone } from '@/components/upload/DropZone'
import { UploadProgress } from '@/components/upload/UploadProgress'
import { UploadSuccess } from '@/components/upload/UploadSuccess'
import { ExpiryPicker } from '@/components/upload/ExpiryPicker'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useUpload } from '@/hooks/useUpload'
import { getTier, getLimits } from '@/lib/limits'
import { validateCustomSlug } from '@/lib/slug'
import { useSafeAuth } from '@/hooks/useSafeAuth'

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
    <section className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-20 pb-16 text-center">
      {/* Background grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: 'linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex flex-col items-center"
      >
        {/* Announcement pill */}
        <Link href="/agents" className="mb-8 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] px-4 py-1.5 text-xs font-medium text-[var(--muted-foreground)] hover:border-[var(--foreground)]/20 transition-colors">
          <span className="flex h-1.5 w-1.5 rounded-full bg-[var(--success)]" />
          New: AI Agent storage API now available
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>

        {/* Headline */}
        <h1 className="max-w-3xl text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight text-[var(--foreground)]">
          Store, host, and search
          <span className="block text-[var(--muted-foreground)] font-extrabold">your files instantly.</span>
        </h1>

        <p className="mt-6 max-w-md text-base text-[var(--muted-foreground)] leading-relaxed">
          Drop a file, get a shareable link in seconds. Built-in semantic search and memory for AI agents.
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/agents">
            <Button size="lg" className="bg-[var(--foreground)] text-[var(--primary-foreground)] hover:bg-[var(--foreground)]/90 px-6">
              Start for free
            </Button>
          </Link>
          <Link href="/pricing">
            <Button variant="outline" size="lg" className="px-6">
              View pricing
            </Button>
          </Link>
        </div>

        {/* Social proof */}
        <p className="mt-5 text-xs text-[var(--muted-foreground)]">
          No credit card required · Free tier always available
        </p>
      </motion.div>

      {/* Upload card */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="relative z-10 mt-14 w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm"
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
                            <div className="flex items-center rounded border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm focus-within:border-[var(--foreground)]/40 transition-colors">
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
                            <span className="ml-auto rounded-full bg-[var(--foreground)]/8 px-2 py-0.5 text-xs font-semibold text-[var(--foreground)]">Sign in</span>
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
    </section>
  )
}
