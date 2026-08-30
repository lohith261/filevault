import { NextRequest, NextResponse } from 'next/server'
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const BASE_DOMAIN = process.env.NEXT_PUBLIC_BASE_DOMAIN ?? 'filevault.host'

const RESERVED_SUBDOMAINS = new Set([
  'www', 'api', 'app', 'admin', 'mail', 'smtp', 'ftp', 'localhost',
  'dashboard', 'login', 'signup', 'pricing', 'blog', 'help', 's', 'tos', 'privacy',
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
  '/help',
  '/tos',
  '/privacy',
  '/not-found',
  '/link-expired',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/s/(.*)',
  '/api/upload',
  '/api/cron/(.*)',
  '/api/domain',
  // The agent API authenticates its own callers via fv_sk_... Bearer tokens
  // (resolveAgent() in every /v1 route handler), not Clerk sessions. Without
  // this, Clerk's auth.protect() blocks every agent API call before it
  // reaches the handler -- see the commit that added this line for the
  // full story.
  '/api/v1(.*)',
])

const clerkHandler = clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect()
  }
})

export default async function handler(req: NextRequest) {
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

  // Custom domain lookup — if the host is not the base domain or a subdomain of it
  if (host !== BASE_DOMAIN && host !== `www.${BASE_DOMAIN}` && !host.endsWith(`.${BASE_DOMAIN}`)) {
    try {
      const lookupUrl = new URL('/api/domain', req.nextUrl.origin)
      lookupUrl.searchParams.set('host', host)
      const res = await fetch(lookupUrl.toString())
      if (res.ok) {
        const { slug } = await res.json() as { slug: string | null }
        if (slug) {
          const url = req.nextUrl.clone()
          url.pathname = `/s/${slug}`
          return NextResponse.rewrite(url)
        }
      }
    } catch {
      // fall through if lookup fails
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
