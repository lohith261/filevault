import JSZip from 'jszip'
import path from 'path'
import { getMimeType, isBlockedExtension } from './mime'

export interface ExtractedFile {
  path: string
  buffer: Buffer
  mimeType: string
  sizeBytes: number
}

const MAX_FILES = 500
const MAX_FILE_SIZE = 25 * 1024 * 1024
const MAX_TOTAL_SIZE = 50 * 1024 * 1024
const SKIP_PATTERNS = ['__MACOSX/', '.DS_Store', 'Thumbs.db', '.git/']

function sanitizePath(rawPath: string): string | null {
  const normalized = path.normalize(rawPath).replace(/\\/g, '/')
  if (normalized.startsWith('/')) return null
  if (normalized.split('/').some((part) => part === '..')) return null
  if (isBlockedExtension(normalized)) return null
  return normalized
}

function shouldSkip(entryName: string): boolean {
  return SKIP_PATTERNS.some((p) => entryName.startsWith(p) || entryName === p.replace('/', ''))
}

export async function extractZip(buffer: Buffer): Promise<ExtractedFile[]> {
  const zip = await JSZip.loadAsync(buffer)
  const files: ExtractedFile[] = []
  let totalSize = 0

  const entries = Object.entries(zip.files)

  for (const [name, entry] of entries) {
    if (entry.dir) continue
    if (shouldSkip(name)) continue

    const sanitized = sanitizePath(name)
    if (!sanitized) continue

    const content = await entry.async('nodebuffer')

    if (content.length > MAX_FILE_SIZE) {
      throw new Error(`File "${sanitized}" exceeds the 25MB per-file limit.`)
    }

    totalSize += content.length
    if (totalSize > MAX_TOTAL_SIZE) {
      throw new Error('Total extracted size exceeds the 50MB limit.')
    }

    files.push({
      path: sanitized,
      buffer: content,
      mimeType: getMimeType(sanitized),
      sizeBytes: content.length,
    })

    if (files.length > MAX_FILES) {
      throw new Error(`ZIP contains more than ${MAX_FILES} files.`)
    }
  }

  if (files.length === 0) {
    throw new Error('ZIP file is empty or contains no supported files.')
  }

  return files
}

export function detectEntryFile(files: ExtractedFile[]): string {
  const paths = files.map((f) => f.path)

  // Prefer index.html at root
  if (paths.includes('index.html')) return 'index.html'

  // Any index.html
  const anyIndex = paths.find((p) => p.endsWith('/index.html'))
  if (anyIndex) return anyIndex

  // First HTML file
  const firstHtml = paths.find((p) => p.endsWith('.html') || p.endsWith('.htm'))
  if (firstHtml) return firstHtml

  return files[0].path
}
