export interface FileEntry {
  path: string
  buffer: Buffer
  mimeType: string
  sizeBytes: number
}

export interface StorageDriver {
  putFiles(slug: string, files: FileEntry[]): Promise<string>
  getFileStream(storageKey: string): Promise<ReadableStream>
  deletePrefix(prefix: string): Promise<void>
}
