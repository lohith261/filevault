import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const page = Math.max(1, Number(searchParams.get('page') ?? 1))
  const search = searchParams.get('search') ?? ''
  const pageSize = 20

  const where = {
    userId,
    ...(search ? { label: { contains: search, mode: 'insensitive' as const } } : {}),
  }

  const [sites, total] = await Promise.all([
    prisma.site.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        _count: { select: { views: true } },
      },
    }),
    prisma.site.count({ where }),
  ])

  return NextResponse.json({
    sites: sites.map((s) => ({
      ...s,
      totalSizeBytes: s.totalSizeBytes.toString(),
      viewCount: s._count.views,
    })),
    total,
    page,
    pageSize,
  })
}
