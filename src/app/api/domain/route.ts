import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const host = new URL(req.url).searchParams.get('host')
  if (!host) return NextResponse.json({ slug: null })

  const site = await prisma.site.findFirst({
    where: { customDomain: host },
    select: { slug: true },
  })

  return NextResponse.json({ slug: site?.slug ?? null })
}
