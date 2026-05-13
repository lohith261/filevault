# FileVault

> **The storage layer AI agents actually need.**
>
> Files, memory, semantic search, and agent-to-agent sharing — one API.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

→ **[filevault.host](https://filevault.host)**

---

## What is FileVault?

Most AI agents are stateless. They lose context between runs. They store files in S3 (dumb blobs) and memories in Pinecone (dumb vectors) — and neither talks to the other.

**FileVault is different.** We built the storage layer that treats agents as first-class citizens:

- **Identity** — every agent gets an API key and its own namespace
- **Files** — upload anything; we extract, chunk, and embed automatically
- **Memory** — persistent working memory with TTL
- **Semantic Search** — natural language queries across files and memory
- **Collections** — scoped knowledge groups
- **Agent-to-Agent Sharing** — grant read access to your indexed files
- **State / Checkpoints** — save and resume execution state
- **MCP Server** — plug into Claude Desktop, Cursor, Cline, and any MCP client

No more stitching together S3 + Pinecone + Redis + custom auth.

---

## Quick Start

### 1. Get an API key

```bash
curl -X POST https://filevault.host/api/v1/agents \
  -H "Content-Type: application/json" \
  -d '{"name": "my-agent"}'
```

Save the `api_key` (starts with `fv_sk_`). It is shown **exactly once**.

### 2. Upload & index a file

```bash
curl -X POST https://filevault.host/api/v1/files \
  -H "Authorization: Bearer fv_sk_..." \
  -F "file=@report.pdf" \
  -F "index=true"
```

### 3. Search in natural language

```bash
curl -X POST https://filevault.host/api/v1/search \
  -H "Authorization: Bearer fv_sk_..." \
  -H "Content-Type: application/json" \
  -d '{"query": "What was the Q3 revenue?", "limit": 5}'
```

### 4. Store memory

```bash
curl -X POST https://filevault.host/api/v1/memory \
  -H "Authorization: Bearer fv_sk_..." \
  -H "Content-Type: application/json" \
  -d '{"content": "User prefers concise bullet points."}'
```

---

## SDKs

### TypeScript

```ts
import { FileVault } from '@filevault/sdk'

const fv = new FileVault('fv_sk_...')

const file = await fv.files.upload(blob, { index: true, metadata: { project: 'q3' } })
const results = await fv.search('What is the refund policy?')
await fv.memory.add('User prefers concise responses.', { ttl_seconds: 86400 })

// Iterate all files with auto-pagination
for await (const f of fv.files.iter()) {
  console.log(f.name)
}
```

### Python

```python
from filevault import FileVault

fv = FileVault("fv_sk_...")

file = fv.files.upload(open("report.pdf", "rb"), name="report.pdf", index=True)
results = fv.search("What is the refund policy?")
fv.memory.add("User prefers concise responses.", ttl_seconds=86400)

# Iterate all files with auto-pagination
for f in fv.files.iter():
    print(f.name)
```

---

## MCP Server

FileVault exposes an MCP server so any compatible client can use it without code.

**Claude Desktop config:**

```json
{
  "mcpServers": {
    "filevault": {
      "command": "npx",
      "args": ["-y", "tsx", "src/mcp/server.ts"],
      "env": { "FILEVAULT_API_KEY": "fv_sk_..." }
    }
  }
}
```

**Available MCP tools:**

| Tool | Description |
|---|---|
| `filevault_upload_file` | Upload and optionally index a file |
| `filevault_search` | Semantic search across files and memory |
| `filevault_store_memory` | Store agent memory with optional TTL |
| `filevault_list_files` | List stored files |
| `filevault_get_usage` | Get usage statistics |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js 16 (Vercel)                      │
│                                                              │
│  AI Agent → /v1/agents   (create identity)                   │
│           → /v1/files    (upload + index)                    │
│           → /v1/search   (semantic retrieval)                │
│           → /v1/memory   (store + recall)                    │
│           → /v1/state    (checkpoints)                       │
│           → /v1/shares   (cross-agent access)                │
│           → /v1/collections (scoped groups)                  │
│                                                              │
└────────────┬──────────────────────────────┬─────────────────┘
             │                              │
      PostgreSQL + pgvector           Cloudflare R2
      (vectors + relational)          (object storage)
             │
    ┌────────┴────────────────────┐
    │  Embedding pipeline          │
    │  extract → chunk → embed     │
    │  (OpenRouter / text-embed)   │
    └──────────────────────────────┘
```

---

## Agent API Reference (v1)

Every endpoint requires `Authorization: Bearer fv_sk_...`.

### Authentication

```
Authorization: Bearer fv_sk_<64 hex chars>
```

### Usage Caps

| Resource | Limit |
|---|---|
| Files | 1,000 |
| Total storage | 1 GB |
| Embedding chunks | 50,000 |
| Active memories | 5,000 |
| State checkpoints | 1,000 |
| File size (single) | 50 MB |
| Batch size | 10 files |

All limits return `429` with a descriptive `error` field.

### Files

| Method | Path | Description |
|---|---|---|
| `GET` | `/v1/files?limit=&cursor=&indexed=` | List files |
| `POST` | `/v1/files` | Upload file (multipart) |
| `POST` | `/v1/files/batch` | Batch upload (up to 10) |
| `GET` | `/v1/files/:id` | Get file metadata |
| `DELETE` | `/v1/files/:id` | Delete file + embeddings |
| `POST` | `/v1/files/:id/index` | Index on demand |

**File object:**
```json
{
  "file_id": "clx...",
  "name": "report.pdf",
  "mime_type": "application/pdf",
  "size_bytes": 1024000,
  "is_indexed": true,
  "index_status": "indexed",
  "metadata": { "project": "q3" },
  "url": "https://...",
  "created_at": "2026-05-05T10:00:00.000Z"
}
```

**Async indexing.** When you upload with `index=true`, the file is accepted immediately and indexing runs in the background. Poll `GET /v1/files/:id` and watch `index_status` transition from `pending` → `indexing` → `indexed` (or `failed`).

### Search

| Method | Path | Description |
|---|---|---|
| `POST` | `/v1/search` | Semantic search |

**Request body:**
```json
{
  "query": "quarterly revenue breakdown",
  "filter": {
    "type": "all",
    "file_id": "clx...",
    "collection_id": "clx...",
    "include_shared": true,
    "metadata": { "project": "q3" }
  },
  "limit": 5
}
```

### Memory

| Method | Path | Description |
|---|---|---|
| `POST` | `/v1/memory` | Store memory |
| `GET` | `/v1/memory?limit=&cursor=` | List memories |
| `DELETE` | `/v1/memory/:id` | Delete a memory entry |

### State / Checkpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/v1/state` | Store or update state |
| `GET` | `/v1/state?limit=&cursor=&key=` | List states |
| `GET` | `/v1/state/:id` | Get single state |
| `DELETE` | `/v1/state/:id` | Delete state |

**State is upserted by key.** If a state with the same `key` exists, it is overwritten.

### Collections

| Method | Path | Description |
|---|---|---|
| `GET` | `/v1/collections` | List collections |
| `POST` | `/v1/collections` | Create collection |
| `GET` | `/v1/collections/:id` | Get collection + files |
| `DELETE` | `/v1/collections/:id` | Delete collection |
| `POST` | `/v1/collections/:id/files` | Add file to collection |
| `DELETE` | `/v1/collections/:id/files/:fileId` | Remove file |

### Sharing

| Method | Path | Description |
|---|---|---|
| `GET` | `/v1/shares` | List shares given & received |
| `POST` | `/v1/shares` | Grant access to another agent |
| `DELETE` | `/v1/shares/:granteeId` | Revoke access |

### Webhooks

| Method | Path | Description |
|---|---|---|
| `GET` | `/v1/webhooks` | Get webhook URL |
| `PUT` | `/v1/webhooks` | Set webhook URL |
| `DELETE` | `/v1/webhooks` | Remove webhook |

**Events:** `file.created`, `file.deleted`, `file.indexed`

### Usage

| Method | Path | Description |
|---|---|---|
| `GET` | `/v1/usage` | File, embedding, memory, and state counts |

---

## Agent Artifacts (Human Hosting)

Agents build things for humans — dashboards, reports, static sites. FileVault can host those too.

Drop a ZIP or HTML file on the homepage, get a shareable URL in seconds. This is the same storage layer; it's just exposed through a human-friendly UI.

| Feature | Anonymous | Free | Pro |
|---|:---:|:---:|:---:|
| Upload ZIP or HTML | ✓ | ✓ | ✓ |
| Max upload size | 5 MB | 10 MB | 100 MB |
| Link expiry | 24 h | 30 days | Never |
| Custom subdomain | — | ✓ | ✓ |
| Custom domain | — | — | ✓ |

---

## Local Development

### Prerequisites

- Node.js 20+
- PostgreSQL 15+ with [pgvector](https://github.com/pgvector/pgvector)

The fastest way is Docker:

```bash
docker compose up -d
```

This spins up `ankane/pgvector` on `localhost:5432`.

### 1. Clone & install

```bash
git clone https://github.com/lohith261/filevault.git
cd filevault
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Minimum for local dev:

```env
DATABASE_URL="postgresql://filevault:filevault@localhost:5432/filevault"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
CRON_SECRET="dev-cron-secret"
OPENROUTER_API_KEY="sk-or-v1-..."
```

### 3. Apply migrations

```bash
npx prisma migrate deploy
npx prisma generate
```

### 4. Start dev server

```bash
node node_modules/next/dist/bin/next dev
```

> `npm run dev` and `npx next dev` fail with MODULE_NOT_FOUND on this Next.js 16 build. Use the full path above.

Open [http://localhost:3000](http://localhost:3000).

### 5. Run MCP server locally

```bash
FILEVAULT_API_KEY=fv_sk_... npm run mcp
```

### 6. Run tests

```bash
npm test
```

---

## Deployment

### Vercel (recommended)

Production runs at **[filevault.host](https://filevault.host)** on Vercel with GitHub auto-deploy on every push to `main`.

1. Import the GitHub repo into Vercel
2. Set all environment variables in **Project → Settings → Environment Variables** (see `.env.example` for the full list)
3. Set `STORAGE_DRIVER=r2` and all five R2 vars — Vercel is serverless, local disk won't work
4. Deploy

> **Migrations:** `prisma migrate deploy` does **not** run during the Vercel build. Run new migrations manually via the Supabase SQL editor or: `DIRECT_URL=<direct_url> node node_modules/.bin/prisma migrate deploy`

### Railway (secondary)

`railway.json` and `scripts/start.sh` are still in the repo but Railway is no longer the primary target.

1. Deploy from GitHub repo → Railway auto-detects `railway.json`
2. Add all env vars (see `.env.example`)
3. `scripts/start.sh` runs `prisma migrate deploy` then starts the server

---

## Tech Stack

| Layer | Library |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| ORM | Prisma 7 |
| Database | PostgreSQL + pgvector |
| Object storage | Cloudflare R2 |
| Embeddings | OpenRouter → `openai/text-embedding-3-small` |
| Auth (human) | Clerk v7 (optional) |
| Auth (agent) | SHA-256 hashed API keys |

---

## Roadmap

### v1.1

- [ ] Streaming search
- [ ] Re-ranking with cross-encoder
- [x] pgvector migration
- [ ] Billing for agent API

### v1.2

- [ ] Knowledge graph API (nodes + edges)
- [ ] Multi-modal embeddings (images)
- [ ] Agent CLI (`npx filevault`)
- [ ] Go and Rust SDKs

---

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Run tests: `npm test`
4. Lint: `npm run lint`
5. Open a PR with a clear description

---

## License

MIT — see [LICENSE](LICENSE) for details.

---

<p align="center">
  Built with <a href="https://nextjs.org">Next.js</a> · <a href="https://prisma.io">Prisma</a> · <a href="https://www.cloudflare.com/developer-platform/r2/">Cloudflare R2</a> · <a href="https://openrouter.ai">OpenRouter</a>
</p>
