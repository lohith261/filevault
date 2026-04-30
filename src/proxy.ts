import { NextRequest, NextResponse } from 'next/server'
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

function isValidClerkKey(key: string | undefined): boolean {
  if (!key) return false
  try {
    // Clerk keys are "pk_live_" or "pk_test_" followed by base64-encoded data containing a domain
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
  if (!CLERK_CONFIGURED) return NextResponse.next()
  return clerkHandler(req, {} as never)
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
