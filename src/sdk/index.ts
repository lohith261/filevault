/**
 * FileVault Agent SDK
 *
 * Minimal TypeScript client for the FileVault Agent Storage API.
 * Works in Node.js, Deno, Bun, and the browser.
 *
 * Usage:
 *   import { FileVault } from '@filevault/sdk'
 *   const fv = new FileVault('fv_sk_...')
 *   const file = await fv.files.upload(blob, { index: true })
 *   const results = await fv.search('What is the refund policy?')
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export interface FileRecord {
  file_id: string
  name: string
  mime_type: string
  size_bytes: number
  is_indexed: boolean
  metadata: Record<string, unknown> | null
  url: string
  created_at: string
}

export interface SearchResult {
  id: string
  type: 'file' | 'memory'
  content: string
  score: number
  file_id?: string
  url?: string
}

export interface MemoryRecord {
  id: string
  content: string
  created_at: string
  expires_at: string | null
}

export interface UsageStats {
  files: { count: number; indexed: number; storage_bytes: number }
  embeddings: { count: number }
  memory: { count: number }
}

export interface SearchOptions {
  filter?: {
    file_id?: string
    type?: 'files' | 'memory' | 'all'
    metadata?: Record<string, unknown>
  }
  limit?: number
}

export interface UploadOptions {
  index?: boolean
  metadata?: Record<string, unknown>
}

export interface BatchUploadOptions {
  index?: boolean
  metadata?: Record<string, unknown>
}

// ── Client ────────────────────────────────────────────────────────────────────

export class FileVaultError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'FileVaultError'
  }
}

export class FileVault {
  readonly files: FilesClient
  readonly memory: MemoryClient

  constructor(
    private readonly apiKey: string,
    private readonly baseUrl: string = 'https://filevault.host'
  ) {
    this.files = new FilesClient(apiKey, baseUrl)
    this.memory = new MemoryClient(apiKey, baseUrl)
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${this.baseUrl}/api/v1${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }))
      throw new FileVaultError(res.status, err.error ?? res.statusText)
    }
    return res.json() as Promise<T>
  }

  async search(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
    const data = await this.request<{ results: SearchResult[] }>('POST', '/search', {
      query,
      filter: options.filter,
      limit: options.limit ?? 5,
    })
    return data.results
  }

  async usage(): Promise<UsageStats> {
    return this.request<UsageStats>('GET', '/usage')
  }

  async getWebhook(): Promise<string | null> {
    const data = await this.request<{ webhook_url: string | null }>('GET', '/webhooks')
    return data.webhook_url
  }

  async setWebhook(url: string): Promise<void> {
    await this.request('PUT', '/webhooks', { url })
  }

  async deleteWebhook(): Promise<void> {
    await this.request('DELETE', '/webhooks')
  }
}

// ── Files sub-client ──────────────────────────────────────────────────────────

class FilesClient {
  constructor(private apiKey: string, private baseUrl: string) {}

  private headers() {
    return { Authorization: `Bearer ${this.apiKey}` }
  }

  async list(options: { limit?: number; cursor?: string; indexed?: boolean } = {}): Promise<{
    files: FileRecord[]
    next_cursor: string | null
  }> {
    const params = new URLSearchParams()
    if (options.limit) params.set('limit', String(options.limit))
    if (options.cursor) params.set('cursor', options.cursor)
    if (options.indexed !== undefined) params.set('indexed', String(options.indexed))

    const res = await fetch(`${this.baseUrl}/api/v1/files?${params}`, { headers: this.headers() })
    if (!res.ok) throw new FileVaultError(res.status, await res.text())
    return res.json()
  }

  async get(fileId: string): Promise<FileRecord> {
    const res = await fetch(`${this.baseUrl}/api/v1/files/${fileId}`, { headers: this.headers() })
    if (!res.ok) throw new FileVaultError(res.status, await res.text())
    return res.json()
  }

  async upload(file: File | Blob, options: UploadOptions = {}): Promise<FileRecord> {
    const form = new FormData()
    form.append('file', file)
    form.append('index', String(options.index ?? false))
    if (options.metadata) form.append('metadata', JSON.stringify(options.metadata))

    const res = await fetch(`${this.baseUrl}/api/v1/files`, {
      method: 'POST',
      headers: this.headers(),
      body: form,
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }))
      throw new FileVaultError(res.status, err.error ?? res.statusText)
    }
    return res.json()
  }

  async uploadBatch(files: (File | Blob)[], options: BatchUploadOptions = {}): Promise<FileRecord[]> {
    const form = new FormData()
    for (const f of files) form.append('files', f)
    form.append('index', String(options.index ?? false))
    if (options.metadata) form.append('metadata', JSON.stringify(options.metadata))

    const res = await fetch(`${this.baseUrl}/api/v1/files/batch`, {
      method: 'POST',
      headers: this.headers(),
      body: form,
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }))
      throw new FileVaultError(res.status, err.error ?? res.statusText)
    }
    const data = await res.json()
    return data.files
  }

  async index(fileId: string): Promise<{ indexed: boolean; chunks_created: number }> {
    const res = await fetch(`${this.baseUrl}/api/v1/files/${fileId}/index`, {
      method: 'POST',
      headers: this.headers(),
    })
    if (!res.ok) throw new FileVaultError(res.status, await res.text())
    return res.json()
  }

  async delete(fileId: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/api/v1/files/${fileId}`, {
      method: 'DELETE',
      headers: this.headers(),
    })
    if (!res.ok && res.status !== 204) throw new FileVaultError(res.status, await res.text())
  }
}

// ── Memory sub-client ─────────────────────────────────────────────────────────

class MemoryClient {
  constructor(private apiKey: string, private baseUrl: string) {}

  private headers() {
    return { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' }
  }

  async list(options: { limit?: number; cursor?: string } = {}): Promise<{
    memories: MemoryRecord[]
    next_cursor: string | null
  }> {
    const params = new URLSearchParams()
    if (options.limit) params.set('limit', String(options.limit))
    if (options.cursor) params.set('cursor', options.cursor)

    const res = await fetch(`${this.baseUrl}/api/v1/memory?${params}`, { headers: this.headers() })
    if (!res.ok) throw new FileVaultError(res.status, await res.text())
    return res.json()
  }

  async add(content: string, options: { ttl_seconds?: number } = {}): Promise<MemoryRecord> {
    const res = await fetch(`${this.baseUrl}/api/v1/memory`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({ content, ttl_seconds: options.ttl_seconds }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }))
      throw new FileVaultError(res.status, err.error ?? res.statusText)
    }
    return res.json()
  }
}
