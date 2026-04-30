import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { getAnalytics } from '@/lib/analytics'

type Params = { params: Promise<{ slug: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { slug } = await params
  const site = await prisma.site.findUnique({ where: { slug } })
  if (!site || site.userId !== userId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const analytics = await getAnalytics(site.id)
  return NextResponse.json(analytics)
}
