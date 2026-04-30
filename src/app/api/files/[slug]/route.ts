import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { storageDriver } from '@/lib/storage'
import { hashPassword } from '@/lib/hash'
import { UpdateSiteSchema } from '@/lib/validations'

type Params = { params: Promise<{ slug: string }> }

async function getOwnedSite(userId: string, slug: string) {
  const site = await prisma.site.findUnique({ where: { slug } })
  if (!site || site.userId !== userId) return null
  return site
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { slug } = await params
  const site = await getOwnedSite(userId, slug)
  if (!site) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await storageDriver.deletePrefix(site.storagePrefix)
  await prisma.site.delete({ where: { id: site.id } })

  return NextResponse.json({ success: true })
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { slug } = await params
  const site = await getOwnedSite(userId, slug)
  if (!site) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const parsed = UpdateSiteSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { label, password, expiresAt } = parsed.data
  const updateData: Record<string, unknown> = {}

  if (label !== undefined) updateData.label = label
  if (expiresAt !== undefined) updateData.expiresAt = expiresAt ? new Date(expiresAt) : null
  if (password !== undefined) {
    updateData.passwordHash = password ? await hashPassword(password) : null
  }

  const updated = await prisma.site.update({
    where: { id: site.id },
    data: updateData,
  })

  return NextResponse.json({ success: true, site: updated })
}
