import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { storageDriver } from '@/lib/storage'
import { hashPassword } from '@/lib/hash'
import { UpdateSiteSchema } from '@/lib/validations'
import { extractZip, detectEntryFile } from '@/lib/unzip'
import { getMimeType, isBlockedExtension } from '@/lib/mime'
import { getTier, getLimits } from '@/lib/limits'
import type { ExtractedFile } from '@/lib/unzip'

type Params = { params: Promise<{ slug: string }> }

async function getUserId(): Promise<string | null> {
  try {
    const { userId } = await auth()
    return userId ?? null
  } catch {
    return null
  }
}

async function getOwnedSite(userId: string, slug: string) {
  const site = await prisma.site.findUnique({ where: { slug } })
  if (!site || site.userId !== userId) return null
  return site
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { slug } = await params
  const site = await getOwnedSite(userId, slug)
  if (!site) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await storageDriver.deletePrefix(site.storagePrefix)
  await prisma.site.delete({ where: { id: site.id } })

  return NextResponse.json({ success: true })
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { slug } = await params
  const site = await getOwnedSite(userId, slug)
  if (!site) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const parsed = UpdateSiteSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { label, password, expiresAt, customDomain } = parsed.data
  const updateData: Record<string, unknown> = {}

  if (label !== undefined) updateData.label = label
  if (expiresAt !== undefined) updateData.expiresAt = expiresAt ? new Date(expiresAt) : null
  if (password !== undefined) {
    updateData.passwordHash = password ? await hashPassword(password) : null
  }
  if (customDomain !== undefined) updateData.customDomain = customDomain || null

  const updated = await prisma.site.update({
    where: { id: site.id },
    data: updateData,
  })

  return NextResponse.json({ success: true, site: updated })
}

export async function PUT(req: NextRequest, { params }: Params) {
  let userId: string | null = null
  let isPro = false
  try {
    const authObj = await auth()
    userId = authObj.userId ?? null
    isPro = userId ? (authObj.has?.({ plan: 'user:pro' }) ?? false) : false
  } catch {}

  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { slug } = await params
  const site = await getOwnedSite(userId, slug)
  if (!site) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const tier = getTier(userId, isPro)
  const limits = getLimits(tier)

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided.' }, { status: 400 })

  if (file.size > limits.maxBytes) {
    const mb = Math.round(limits.maxBytes / 1024 / 1024)
    return NextResponse.json({ error: `File too large. ${mb} MB max for your plan.` }, { status: 413 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  let extractedFiles: ExtractedFile[]

  const isZip =
    file.type === 'application/zip' ||
    file.type === 'application/x-zip-compressed' ||
    file.name.endsWith('.zip')

  if (isZip) {
    extractedFiles = await extractZip(buffer)
  } else {
    if (isBlockedExtension(file.name)) {
      return NextResponse.json({ error: 'File type not allowed.' }, { status: 400 })
    }
    extractedFiles = [{
      path: file.name,
      buffer,
      mimeType: getMimeType(file.name) || file.type,
      sizeBytes: file.size,
    }]
  }

  const entryFile = detectEntryFile(extractedFiles)
  const totalSizeBytes = extractedFiles.reduce((sum, f) => sum + f.sizeBytes, 0)

  await storageDriver.deletePrefix(site.storagePrefix)
  const storagePrefix = await storageDriver.putFiles(slug, extractedFiles)

  await prisma.$transaction(async (tx) => {
    await tx.siteFile.deleteMany({ where: { siteId: site.id } })
    await tx.site.update({
      where: { id: site.id },
      data: { totalSizeBytes: BigInt(totalSizeBytes), entryFile, storagePrefix },
    })
    await tx.siteFile.createMany({
      data: extractedFiles.map((f) => ({
        siteId: site.id,
        path: f.path,
        mimeType: f.mimeType,
        sizeBytes: f.sizeBytes,
        storageKey: `${storagePrefix}/${f.path}`,
      })),
    })
  })

  return NextResponse.json({ slug, fileCount: extractedFiles.length, totalSizeBytes, entryFile })
}
