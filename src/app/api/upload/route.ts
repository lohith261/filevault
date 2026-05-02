import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { auth } from '@clerk/nextjs/server'
import { extractZip, detectEntryFile } from '@/lib/unzip'
import { getMimeType, isBlockedExtension } from '@/lib/mime'
import { storageDriver } from '@/lib/storage'
import { generateSlug } from '@/lib/slug'
import { hashPassword } from '@/lib/hash'
import { prisma } from '@/lib/prisma'
import { expiryToDate, EXPIRY_OPTIONS, type ExpiryOption } from '@/lib/validations'
import { getTier, getLimits, capExpiry } from '@/lib/limits'
import { validateCustomSlug } from '@/lib/slug'
import type { ExtractedFile } from '@/lib/unzip'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    let userId: string | null = null
    let isPro = false
    try {
      const authObj = await auth()
      userId = authObj.userId ?? null
      isPro = userId ? (authObj.has?.({ plan: 'user:pro' }) ?? false) : false
    } catch {
      // Clerk not configured — anonymous mode
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const expiry = (formData.get('expiry') as string) ?? '24h'
    const password = formData.get('password') as string | null
    const label = (formData.get('label') as string) ?? ''
    const customSlug = (formData.get('slug') as string | null)?.trim().toLowerCase() || null

    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 })
    }

    const tier = getTier(userId, isPro)
    const limits = getLimits(tier)

    // File size check
    if (file.size > limits.maxBytes) {
      const mb = Math.round(limits.maxBytes / 1024 / 1024)
      const upgrade = tier === 'anon'
        ? ' Sign in for a higher limit.'
        : tier === 'free'
        ? ' Upgrade to Pro for 100 MB.'
        : ''
      return NextResponse.json(
        { error: `File too large. ${mb} MB max for your plan.${upgrade}` },
        { status: 413 }
      )
    }

    // Password check
    if (password && !limits.passwordAllowed) {
      return NextResponse.json(
        { error: 'Password protection requires a free account.' },
        { status: 403 }
      )
    }

    // Anonymous daily IP limit
    if (tier === 'anon' && limits.dailyAnonLimit !== null) {
      const ip =
        req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
        req.headers.get('x-real-ip') ??
        'unknown'
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000)
      const count = await prisma.anonUploadLog.count({
        where: { ip, createdAt: { gte: since } },
      })
      if (count >= limits.dailyAnonLimit) {
        return NextResponse.json(
          { error: `Anonymous upload limit reached (${limits.dailyAnonLimit} per day). Sign in for more.` },
          { status: 429 }
        )
      }
    }

    // Free tier link count limit
    if (tier === 'free' && limits.maxLinks !== null && userId) {
      const linkCount = await prisma.site.count({ where: { userId } })
      if (linkCount >= limits.maxLinks) {
        return NextResponse.json(
          { error: `You've reached the ${limits.maxLinks}-link limit on the free plan. Upgrade to Pro for unlimited links.` },
          { status: 403 }
        )
      }
    }

    // Custom slug — signed-in users only
    if (customSlug) {
      if (!limits.customSlugAllowed) {
        return NextResponse.json(
          { error: 'Custom slugs require a free account. Sign in to use this feature.' },
          { status: 403 }
        )
      }
      const slugError = validateCustomSlug(customSlug)
      if (slugError) {
        return NextResponse.json({ error: slugError }, { status: 400 })
      }
    }

    if (!EXPIRY_OPTIONS.includes(expiry as ExpiryOption)) {
      return NextResponse.json({ error: 'Invalid expiry option.' }, { status: 400 })
    }

    const finalExpiry = capExpiry(expiry as ExpiryOption, limits.maxExpiryOption)

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
      extractedFiles = [
        {
          path: file.name,
          buffer,
          mimeType: getMimeType(file.name) || file.type,
          sizeBytes: file.size,
        },
      ]
    }

    const slug = customSlug ?? generateSlug()
    const storagePrefix = await storageDriver.putFiles(slug, extractedFiles)
    const entryFile = detectEntryFile(extractedFiles)
    const totalSizeBytes = extractedFiles.reduce((sum, f) => sum + f.sizeBytes, 0)
    const expiresAt = expiryToDate(finalExpiry)
    const passwordHash = password ? await hashPassword(password) : null

    await prisma.$transaction(async (tx) => {
      const site = await tx.site.create({
        data: {
          slug,
          label,
          userId,
          passwordHash,
          expiresAt,
          totalSizeBytes: BigInt(totalSizeBytes),
          entryFile,
          storagePrefix,
        },
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

      // Log anonymous uploads for daily rate limiting
      if (tier === 'anon') {
        const ip =
          req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
          req.headers.get('x-real-ip') ??
          'unknown'
        await tx.anonUploadLog.create({ data: { ip } })
      }
    })

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? ''
    return NextResponse.json({
      slug,
      url: `${baseUrl}/s/${slug}`,
      expiresAt: expiresAt?.toISOString() ?? null,
      fileCount: extractedFiles.length,
      totalSizeBytes,
    })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return NextResponse.json(
        { error: 'That slug is already taken. Try a different name.' },
        { status: 409 }
      )
    }
    const message = err instanceof Error ? err.message : 'Upload failed.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
