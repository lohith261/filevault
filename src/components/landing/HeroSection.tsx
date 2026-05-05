'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'

const CODE_LINES = [
  { text: 'import { FileVault } from ', class: 'code-keyword' },
  { text: '"@filevault/sdk"', class: 'code-string' },
  { text: '', class: '' },
  { text: 'const fv = new FileVault(', class: 'code-keyword' },
  { text: '"fv_sk_..."', class: 'code-string' },
  { text: ')', class: 'code-keyword' },
  { text: '', class: '' },
  { text: '// Upload & index a file for semantic search', class: 'code-comment' },
  { text: 'const file = await fv.files.upload(blob, {', class: 'code-keyword' },
  { text: '  index: true,', class: 'code-function' },
  { text: '  metadata: { project: "q3" }', class: 'code-function' },
  { text: '})', class: 'code-keyword' },
  { text: '', class: '' },
  { text: '// Search across files and memory', class: 'code-comment' },
  { text: 'const results = await fv.search(', class: 'code-keyword' },
  { text: '  "What was the Q3 revenue?"', class: 'code-string' },
  { text: ')', class: 'code-keyword' },
  { text: '', class: '' },
  { text: '// Share knowledge with another agent', class: 'code-comment' },
  { text: 'await fv.shares.grant(', class: 'code-keyword' },
  { text: '  "agent_2k9f..."', class: 'code-string' },
  { text: ')', class: 'code-keyword' },
]

function CodeTerminal() {
  const [visibleLines, setVisibleLines] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleLines((prev) => {
        if (prev >= CODE_LINES.length) {
          clearInterval(interval)
          return prev
        }
        return prev + 1
      })
    }, 80)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="code-block shadow-2xl shadow-black/20 w-full max-w-lg">
      <div className="code-header">
        <div className="code-dot bg-red-500/80" />
        <div className="code-dot bg-yellow-500/80" />
        <div className="code-dot bg-green-500/80" />
        <span className="ml-2 text-xs text-zinc-500 font-mono">agent.ts</span>
      </div>
      <div className="code-content">
        {CODE_LINES.map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: i < visibleLines ? 1 : 0, x: i < visibleLines ? 0 : -4 }}
            transition={{ duration: 0.15 }}
            className="flex"
          >
            <span className="inline-block w-8 text-right mr-4 text-zinc-700 select-none shrink-0">
              {line.text ? i + 1 : ''}
            </span>
            <span className={line.class}>{line.text}</span>
            {i === visibleLines - 1 && line.text && (
              <span className="terminal-cursor" />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Animated mesh background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="mesh-blob mesh-blob-1 w-[600px] h-[600px] top-[-100px] left-[-100px]" />
        <div className="mesh-blob mesh-blob-2 w-[500px] h-[500px] bottom-[-100px] right-[-100px]" />
        <div className="mesh-blob mesh-blob-3 w-[400px] h-[400px] top-[40%] left-[60%]" />
        <div className="absolute inset-0 bg-grid opacity-[0.4]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Copy */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            {/* Pill badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-8 inline-flex"
            >
              <Link
                href="/agents"
                className="group inline-flex items-center gap-2 rounded-full border border-[var(--brand)]/20 bg-[var(--brand-muted)] px-4 py-1.5 text-xs font-semibold text-[var(--brand)] hover:border-[var(--brand)]/40 transition-colors"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--brand)] opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--brand)]" />
                </span>
                Now with MCP Server support
                <svg className="h-3 w-3 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </motion.div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight text-[var(--foreground)]">
              The storage layer{' '}
              <span className="gradient-text">AI agents</span>{' '}
              actually need.
            </h1>

            <p className="mt-6 max-w-lg text-lg text-[var(--muted-foreground)] leading-relaxed">
              Files, memory, semantic search, and agent-to-agent sharing — all through one API.
              No more duct-taping S3 to Pinecone to Redis.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/agents">
                <Button
                  size="lg"
                  className="bg-[var(--brand)] text-[var(--brand-foreground)] hover:opacity-90 px-6 shadow-lg shadow-[var(--brand-glow)] transition-all hover:shadow-xl hover:shadow-[var(--brand-glow)]"
                >
                  Get API Key
                  <svg className="h-4 w-4 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Button>
              </Link>
              <Link href="/help">
                <Button variant="outline" size="lg" className="px-6 border-[var(--border)] hover:border-[var(--brand)]/30 hover:bg-[var(--brand-muted)]/50 transition-all">
                  Read the Docs
                </Button>
              </Link>
            </div>

            <div className="mt-8 flex items-center gap-6 text-xs text-[var(--muted-foreground)]">
              <div className="flex items-center gap-1.5">
                <svg className="h-3.5 w-3.5 text-[var(--success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Zero-dep TS & Python SDKs</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="h-3.5 w-3.5 text-[var(--success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>MCP Compatible</span>
              </div>
            </div>
          </motion.div>

          {/* Right: Code terminal */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
            className="hidden lg:flex justify-center"
          >
            <div className="relative">
              {/* Glow behind terminal */}
              <div className="absolute -inset-4 bg-gradient-to-r from-[var(--brand)]/10 to-[var(--brand-secondary)]/10 rounded-3xl blur-2xl" />
              <CodeTerminal />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] uppercase tracking-widest text-[var(--muted-foreground)]">Scroll</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-5 h-8 rounded-full border-2 border-[var(--border)] flex justify-center pt-1.5"
        >
          <div className="w-1 h-1.5 rounded-full bg-[var(--muted-foreground)]" />
        </motion.div>
      </motion.div>
    </section>
  )
}
