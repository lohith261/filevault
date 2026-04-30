import { put, del, list } from '@vercel/blob'
import type { StorageDriver, FileEntry } from './types'

export const vercelBlobDriver: StorageDriver = {
  async putFiles(slug: string, files: FileEntry[]): Promise<string> {
    const results = await Promise.all(
      files.map((f) =>
        put(`sites/${slug}/${f.path}`, f.buffer, {
          access: 'public',
          contentType: f.mimeType,
          addRandomSuffix: false,
        })
      )
    )
    // Return the blob base URL up to (but not including) the path so that
    // the upload route can construct: storageKey = `${prefix}/${f.path}`
    // which becomes the full fetchable URL.
    const firstUrl = results[0].url  // e.g. https://abc.public.blob.vercel-storage.com/sites/slug/index.html
    const blobBase = firstUrl.slice(0, firstUrl.indexOf('/sites/'))
    return `${blobBase}/sites/${slug}`
  },

  async getFileStream(storageKey: string): Promise<ReadableStream> {
    // storageKey is the full blob URL
    const res = await fetch(storageKey)
    if (!res.ok) throw new Error(`Blob fetch failed: ${res.status}`)
    return res.body as ReadableStream
  },

  async deletePrefix(prefix: string): Promise<void> {
    // prefix is the full URL like https://abc.public.blob.vercel-storage.com/sites/slug
    // extract just the path part for list()
    const url = new URL(prefix)
    const pathPrefix = url.pathname.slice(1) // strip leading /
    let cursor: string | undefined
    do {
      const { blobs, cursor: next } = await list({ prefix: pathPrefix, cursor, limit: 1000 })
      if (blobs.length > 0) await del(blobs.map((b) => b.url))
      cursor = next
    } while (cursor)
  },
}
