import type { Metadata } from 'next'
import { Geist, Geist_Mono, Instrument_Serif } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
})

const instrumentSerif = Instrument_Serif({
  variable: '--font-serif',
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'FileVault — Give your AI a memory',
  description:
    'FileVault gives AI agents their own storage, memory, and search. One API key. No setup.',
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/icon.png',
  },
  openGraph: {
    title: 'FileVault — Give your AI a memory',
    description: 'FileVault gives AI agents their own storage, memory, and search. One API key.',
    type: 'website',
    images: [{ url: '/logo.png', width: 480, height: 480, alt: 'FileVault' }],
  },
}

const CLERK_CONFIGURED = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const inner = (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} antialiased`}>
      <body className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        <ThemeProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
  return CLERK_CONFIGURED ? <ClerkProvider>{inner}</ClerkProvider> : inner
}
