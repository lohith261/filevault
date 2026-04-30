import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { storageDriver } from '@/lib/storage'
import { verifyPassword } from '@/lib/hash'
import { recordView } from '@/lib/analytics'
import { cookies } from 'next/headers'

type Params = { params: Promise<{ slug: string; path: string[] }> }

function passwordPromptHtml(slug: string, error = false): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Password Required — FileVault</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:system-ui,sans-serif;background:#09090b;color:#fafafa;display:flex;align-items:center;justify-content:center;min-height:100vh}
  .card{background:#18181b;border:1px solid #27272a;border-radius:12px;padding:2rem;width:100%;max-width:380px}
  h1{font-size:1.25rem;font-weight:600;margin-bottom:.5rem}
  p{font-size:.875rem;color:#a1a1aa;margin-bottom:1.5rem}
  input{width:100%;padding:.625rem .875rem;background:#09090b;border:1px solid #27272a;border-radius:8px;color:#fafafa;font-size:.875rem;outline:none;margin-bottom:1rem}
  input:focus{border-color:#7c3aed}
  button{width:100%;padding:.625rem;background:#7c3aed;color:#fff;border:none;border-radius:8px;font-size:.875rem;font-weight:500;cursor:pointer}
  button:hover{background:#6d28d9}
  .error{color:#f87171;font-size:.8125rem;margin-bottom:.75rem}
  .lock{font-size:2rem;margin-bottom:1rem}
</style>
</head>
<body>
<div class="card">
  <div class="lock">🔒</div>
  <h1>Password Required</h1>
  <p>This site is password-protected.</p>
  ${error ? '<p class="error">Incorrect password. Try again.</p>' : ''}
  <form method="POST">
    <input type="hidden" name="slug" value="${slug}">
    <input type="password" name="password" placeholder="Enter password" autofocus required>
    <button type="submit">Unlock</button>
  </form>
</div>
</body>
</html>`
}

export async function GET(req: NextRequest, { params }: Params) {
  const { slug, path: pathSegments } = await params
  const filePath = pathSegments.join('/')

  const site = await prisma.site.findUnique({
    where: { slug },
    select: { id: true, passwordHash: true, expiresAt: true },
  })

  if (!site) {
    return new NextResponse('Not found', { status: 404 })
  }

  if (site.expiresAt && site.expiresAt < new Date()) {
    return new NextResponse('This site has expired.', { status: 410 })
  }

  // Password gate
  if (site.passwordHash) {
    const cookieStore = await cookies()
    const cookieVal = cookieStore.get(`fv_pw_${slug}`)?.value
    const valid = cookieVal ? await verifyPassword(cookieVal, site.passwordHash) : false
    if (!valid) {
      return new NextResponse(passwordPromptHtml(slug), {
        status: 401,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      })
    }
  }

  // Record view (fire and forget)
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null
  const ua = req.headers.get('user-agent')
  recordView(site.id, ip, ua)

  const siteFile = await prisma.siteFile.findUnique({
    where: { siteId_path: { siteId: site.id, path: filePath } },
  })

  if (!siteFile) {
    // Try index.html for directory requests
    if (!filePath.includes('.')) {
      const indexFile = await prisma.siteFile.findUnique({
        where: { siteId_path: { siteId: site.id, path: `${filePath}/index.html` } },
      })
      if (indexFile) {
        return NextResponse.redirect(new URL(`/s/${slug}/${filePath}/index.html`, req.url), 307)
      }
    }
    return new NextResponse('File not found', { status: 404 })
  }

  const stream = await storageDriver.getFileStream(siteFile.storageKey)

  return new NextResponse(stream, {
    headers: {
      'Content-Type': siteFile.mimeType,
      'Cache-Control': 'public, max-age=3600',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': 'sandbox allow-scripts allow-same-origin allow-popups allow-forms',
      'X-Frame-Options': 'SAMEORIGIN',
    },
  })
}

export async function POST(req: NextRequest, { params }: Params) {
  const { slug, path: pathSegments } = await params

  const site = await prisma.site.findUnique({
    where: { slug },
    select: { passwordHash: true },
  })

  if (!site?.passwordHash) {
    return NextResponse.redirect(new URL(`/s/${slug}/${pathSegments.join('/')}`, req.url))
  }

  const formData = await req.formData()
  const password = formData.get('password') as string

  const valid = password ? await verifyPassword(password, site.passwordHash) : false

  if (!valid) {
    return new NextResponse(passwordPromptHtml(slug, true), {
      status: 401,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }

  const response = NextResponse.redirect(new URL(`/s/${slug}/${pathSegments.join('/')}`, req.url))
  response.cookies.set(`fv_pw_${slug}`, password, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24,
    path: `/s/${slug}`,
  })
  return response
}
