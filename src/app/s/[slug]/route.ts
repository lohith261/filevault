import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type Params = { params: Promise<{ slug: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { slug } = await params

  const site = await prisma.site.findUnique({
    where: { slug },
    select: { entryFile: true, expiresAt: true },
  })

  if (!site) {
    return new NextResponse('Not found', { status: 404 })
  }

  if (site.expiresAt && site.expiresAt < new Date()) {
    return new NextResponse('This site has expired.', { status: 410 })
  }

  return NextResponse.redirect(
    new URL(`/s/${slug}/${site.entryFile}`, _req.url),
    { status: 307 }
  )
}
