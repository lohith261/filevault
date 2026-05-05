#!/usr/bin/env node
/**
 * FileVault MCP Server
 *
 * Exposes FileVault Agent API operations as MCP tools.
 * Compatible with Claude Desktop, Cursor, Cline, and any MCP client.
 *
 * Usage:
 *   FILEVAULT_API_KEY=fv_sk_... npx tsx src/mcp/server.ts
 *
 * Or add to claude_desktop_config.json:
 *   {
 *     "mcpServers": {
 *       "filevault": {
 *         "command": "npx",
 *         "args": ["-y", "tsx", "src/mcp/server.ts"],
 *         "env": { "FILEVAULT_API_KEY": "fv_sk_..." }
 *       }
 *     }
 *   }
 */

import { readFileSync } from 'fs'
import { resolve } from 'path'
import { z } from 'zod'

// Dynamic import ESM-only SDK
async function main() {
  const { McpServer } = await import('@modelcontextprotocol/sdk/server/mcp.js')
  const { StdioServerTransport } = await import('@modelcontextprotocol/sdk/server/stdio.js')

  const API_KEY = process.env.FILEVAULT_API_KEY ?? ''
  const BASE_URL = (process.env.FILEVAULT_BASE_URL ?? 'https://filevault.host').replace(/\/$/, '')

  if (!API_KEY) {
    console.error('FILEVAULT_API_KEY environment variable is required')
    process.exit(1)
  }

  const server = new McpServer(
    {
      name: 'filevault',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  )

  // ── Helper ─────────────────────────────────────────────────────────────────
  async function fvFetch(path: string, init?: RequestInit): Promise<unknown> {
    const res = await fetch(`${BASE_URL}/api/v1${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        ...init?.headers,
      },
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }))
      throw new Error(`FileVault API error (${res.status}): ${err.error ?? res.statusText}`)
    }
    return res.json()
  }

  // ── Tool: upload_file ──────────────────────────────────────────────────────
  server.tool(
    'filevault_upload_file',
    'Upload a file to FileVault and optionally index it for semantic search. Accepts a local file path.',
    {
      file_path: z.string().describe('Absolute or relative path to the local file to upload'),
      index: z.boolean().default(true).describe('Whether to extract text, chunk, and embed the file for semantic search'),
      metadata: z.record(z.string(), z.any()).optional().describe('Optional metadata key-value pairs to attach to the file'),
    },
    async ({ file_path, index, metadata }) => {
      const buffer = readFileSync(resolve(file_path))
      const blob = new Blob([buffer])
      const form = new FormData()
      form.append('file', blob, file_path.split('/').pop() ?? 'file')
      form.append('index', String(index))
      if (metadata) form.append('metadata', JSON.stringify(metadata))

      const res = await fetch(`${BASE_URL}/api/v1/files`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${API_KEY}` },
        body: form,
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }))
        return {
          content: [{ type: 'text', text: `Upload failed: ${err.error ?? res.statusText}` }],
          isError: true,
        }
      }
      const data = (await res.json()) as Record<string, unknown>
      return {
        content: [
          {
            type: 'text',
            text: `File uploaded successfully.\nID: ${data.file_id}\nName: ${data.name}\nSize: ${data.size_bytes} bytes\nIndexed: ${data.is_indexed}\nURL: ${data.url}`,
          },
        ],
      }
    }
  )

  // ── Tool: search ───────────────────────────────────────────────────────────
  server.tool(
    'filevault_search',
    'Perform semantic search across indexed files and agent memory using natural language.',
    {
      query: z.string().describe('Natural language query to search for'),
      filter_type: z.enum(['all', 'files', 'memory']).default('all').describe('Restrict search to files only, memory only, or both'),
      limit: z.number().min(1).max(20).default(5).describe('Maximum number of results to return'),
    },
    async ({ query, filter_type, limit }) => {
      const data = (await fvFetch('/search', {
        method: 'POST',
        body: JSON.stringify({
          query,
          filter: { type: filter_type },
          limit,
        }),
      })) as { results: Array<{ type: string; content: string; score: number; url?: string }> }

      if (!data.results || data.results.length === 0) {
        return {
          content: [{ type: 'text', text: `No results found for "${query}".` }],
        }
      }

      const lines = data.results.map((r, i) => {
        const score = (r.score * 100).toFixed(1)
        const url = r.url ? `\n  URL: ${r.url}` : ''
        return `${i + 1}. [${r.type.toUpperCase()}] ${score}% match${url}\n   ${r.content.slice(0, 300)}${r.content.length > 300 ? '...' : ''}`
      })

      return {
        content: [
          {
            type: 'text',
            text: `Found ${data.results.length} result(s) for "${query}":\n\n${lines.join('\n\n')}`,
          },
        ],
      }
    }
  )

  // ── Tool: store_memory ─────────────────────────────────────────────────────
  server.tool(
    'filevault_store_memory',
    'Store a piece of text as agent memory with an optional TTL. Memories are searchable via semantic search.',
    {
      content: z.string().describe('Text content to store as memory'),
      ttl_seconds: z.number().optional().describe('Optional time-to-live in seconds. Omit for permanent memory.'),
    },
    async ({ content, ttl_seconds }) => {
      const data = (await fvFetch('/memory', {
        method: 'POST',
        body: JSON.stringify({ content, ...(ttl_seconds ? { ttl: ttl_seconds } : {}) }),
      })) as { memory_id: string; expires_at?: string }

      return {
        content: [
          {
            type: 'text',
            text: `Memory stored.\nID: ${data.memory_id}${data.expires_at ? `\nExpires: ${data.expires_at}` : ''}`,
          },
        ],
      }
    }
  )

  // ── Tool: list_files ───────────────────────────────────────────────────────
  server.tool(
    'filevault_list_files',
    'List files stored by the agent. Optionally filter by index status.',
    {
      limit: z.number().min(1).max(100).default(20).describe('Maximum number of files to return'),
      indexed_only: z.boolean().default(false).describe('Only return files that have been indexed for search'),
    },
    async ({ limit, indexed_only }) => {
      const params = new URLSearchParams()
      params.set('limit', String(limit))
      if (indexed_only) params.set('indexed', 'true')

      const data = (await fvFetch(`/files?${params.toString()}`)) as {
        files: Array<{ file_id: string; name: string; size_bytes: number; is_indexed: boolean; created_at: string }>
      }

      if (!data.files || data.files.length === 0) {
        return {
          content: [{ type: 'text', text: 'No files found.' }],
        }
      }

      const lines = data.files.map((f) => {
        const size = f.size_bytes < 1024 ? `${f.size_bytes} B` : f.size_bytes < 1024 * 1024 ? `${(f.size_bytes / 1024).toFixed(1)} KB` : `${(f.size_bytes / (1024 * 1024)).toFixed(1)} MB`
        const status = f.is_indexed ? 'indexed' : 'not indexed'
        return `- ${f.name} (${size}) · ${status} · ${f.created_at.slice(0, 10)}`
      })

      return {
        content: [
          {
            type: 'text',
            text: `Files (${data.files.length}):\n${lines.join('\n')}`,
          },
        ],
      }
    }
  )

  // ── Tool: get_usage ────────────────────────────────────────────────────────
  server.tool(
    'filevault_get_usage',
    'Get current usage statistics for the agent: file count, indexed count, storage bytes, embedding count, memory count.',
    {},
    async () => {
      const data = (await fvFetch('/usage')) as {
        files: { count: number; indexed: number; storage_bytes: number }
        embeddings: { count: number }
        memory: { count: number }
      }

      const storage = data.files.storage_bytes
      const storageStr = storage < 1024 * 1024 ? `${(storage / 1024).toFixed(1)} KB` : `${(storage / (1024 * 1024)).toFixed(1)} MB`

      return {
        content: [
          {
            type: 'text',
            text: `Usage Stats:\n- Files: ${data.files.count} (${data.files.indexed} indexed)\n- Storage: ${storageStr}\n- Embeddings: ${data.embeddings.count}\n- Memories: ${data.memory.count}`,
          },
        ],
      }
    }
  )

  // ── Start server ───────────────────────────────────────────────────────────
  const transport = new StdioServerTransport()
  await server.connect(transport)

  // Notify readiness on stderr so stdout stays pure JSON-RPC
  console.error('FileVault MCP server running on stdio')
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
