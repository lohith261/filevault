import { NextRequest, NextResponse } from 'next/server'
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const BASE_DOMAIN = process.env.NEXT_PUBLIC_BASE_DOMAIN ?? 'filevault.host'

const RESERVED_SUBDOMAINS = new Set([
  'www', 'api', 'app', 'admin', 'mail', 'smtp', 'ftp', 'localhost',
])

function isValidClerkKey(key: string | undefined): boolean {
  if (!key) return false
  try {
    const [, encoded] = key.split('_', 3).slice(1)
    if (!encoded) return false
    const decoded = Buffer.from(encoded, 'base64').toString('utf8')
    return decoded.includes('.')
  } catch {
    return false
  }
}

const CLERK_CONFIGURED = isValidClerkKey(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)

const isPublicRoute = createRouteMatcher([
  '/',
  '/pricing',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/s/(.*)',
  '/api/upload',
  '/api/cron/(.*)',
])

const clerkHandler = clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect()
  }
})

export default function handler(req: NextRequest) {
  const host = req.headers.get('host') ?? ''

  // Rewrite subdomain requests to /s/[slug] before auth runs
  if (host.endsWith(`.${BASE_DOMAIN}`)) {
    const subdomain = host.slice(0, -(BASE_DOMAIN.length + 1))
    if (subdomain && !RESERVED_SUBDOMAINS.has(subdomain)) {
      const url = req.nextUrl.clone()
      url.pathname = `/s/${subdomain}`
      return NextResponse.rewrite(url)
    }
  }

  if (!CLERK_CONFIGURED) return NextResponse.next()
  return clerkHandler(req, {} as never)
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
