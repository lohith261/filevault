import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { extractZip, detectEntryFile } from '@/lib/unzip'
import { getMimeType, isBlockedExtension } from '@/lib/mime'
import { storageDriver } from '@/lib/storage'
import { generateSlug } from '@/lib/slug'
import { hashPassword } from '@/lib/hash'
import { prisma } from '@/lib/prisma'
import {
  expiryToDate,
  EXPIRY_OPTIONS,
  type ExpiryOption,
  MAX_UPLOAD_SIZE,
  ANON_MAX_SIZE,
  ANON_MAX_EXPIRY_HOURS,
} from '@/lib/validations'
import type { ExtractedFile } from '@/lib/unzip'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const authObj = await auth()
    const { userId } = authObj
    const isPro = authObj.has({ plan: 'user:pro' })

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const expiry = (formData.get('expiry') as string) ?? '24h'
    const password = formData.get('password') as string | null
    const label = (formData.get('label') as string) ?? ''

    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 })
    }

    const isAnon = !userId
    const maxSize = isPro ? MAX_UPLOAD_SIZE : ANON_MAX_SIZE

    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large. Max size is ${isPro ? '50MB' : '10MB'}. ${!isPro ? 'Upgrade to Pro for 50MB uploads.' : ''}`.trim() },
        { status: 413 }
      )
    }

    if (!EXPIRY_OPTIONS.includes(expiry as ExpiryOption)) {
      return NextResponse.json({ error: 'Invalid expiry option.' }, { status: 400 })
    }

    // Free/anon users: cap expiry at 24h
    let finalExpiry = expiry as ExpiryOption
    if (!isPro && (finalExpiry === 'never' || finalExpiry === '30d' || finalExpiry === '7d')) {
      finalExpiry = '24h'
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
      extractedFiles = [
        {
          path: file.name,
          buffer,
          mimeType: getMimeType(file.name) || file.type,
          sizeBytes: file.size,
        },
      ]
    }

    const slug = generateSlug()
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
    const message = err instanceof Error ? err.message : 'Upload failed.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
