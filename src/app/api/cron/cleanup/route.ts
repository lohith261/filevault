import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { storageDriver } from '@/lib/storage'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const expired = await prisma.site.findMany({
    where: { expiresAt: { lt: new Date() } },
    select: { id: true, storagePrefix: true },
  })

  let deleted = 0
  for (const site of expired) {
    try {
      await storageDriver.deletePrefix(site.storagePrefix)
      await prisma.site.delete({ where: { id: site.id } })
      deleted++
    } catch (err) {
      console.error(`Failed to clean up site ${site.id}:`, err)
    }
  }

  return NextResponse.json({ deleted, total: expired.length })
}
