import fs from 'fs'
import fsp from 'fs/promises'
import path from 'path'
import { Readable } from 'stream'
import type { FileEntry, StorageDriver } from './types'

const UPLOADS_DIR = path.join(process.cwd(), 'uploads')

export const localDriver: StorageDriver = {
  async putFiles(slug, files) {
    const prefix = path.join(UPLOADS_DIR, slug)
    await fsp.mkdir(prefix, { recursive: true })

    await Promise.all(
      files.map(async (file) => {
        const dest = path.join(prefix, file.path)
        await fsp.mkdir(path.dirname(dest), { recursive: true })
        await fsp.writeFile(dest, file.buffer)
      })
    )

    return prefix
  },

  async getFileStream(storageKey) {
    const nodeStream = fs.createReadStream(storageKey)
    return Readable.toWeb(nodeStream) as ReadableStream
  },

  async deletePrefix(prefix) {
    await fsp.rm(prefix, { recursive: true, force: true })
  },
}
