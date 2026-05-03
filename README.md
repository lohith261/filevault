# FileVault

> Instant static hosting + AI-native storage infrastructure for agents.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com)
[![Prisma](https://img.shields.io/badge/Prisma-7-2d3748?logo=prisma)](https://prisma.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

→ **[filevault.host](https://filevault.host)**

---

## What is FileVault?

FileVault started as a one-click static hosting tool. It has evolved into **two products sharing one codebase**:

| Product | Who it's for | How to use |
|---|---|---|
| **Web Hosting** | Humans | Drop a ZIP or HTML file on the homepage, get a shareable URL |
| **Agent Storage API** | AI agents & developers | REST API with API-key auth, file storage, semantic search, and memory |

Both products share the same database, storage layer (Cloudflare R2), and deployment.

---

## Table of Contents

1. [Architecture](#architecture)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Local Development](#local-development)
5. [Environment Variables](#environment-variables)
6. [Web Hosting Features](#web-hosting-features)
7. [Agent API (v1)](#agent-api-v1)
   - [Authentication](#authentication)
   - [POST /v1/agents](#post-v1agents)
   - [GET /v1/files](#get-v1files)
   - [POST /v1/files](#post-v1files)
   - [GET /v1/files/:id](#get-v1filesid)
   - [DELETE /v1/files/:id](#delete-v1filesid)
   - [POST /v1/files/:id/index](#post-v1filesidindex)
   - [POST /v1/search](#post-v1search)
   - [POST /v1/memory](#post-v1memory)
   - [GET /v1/memory](#get-v1memory)
8. [Storage: Cloudflare R2](#storage-cloudflare-r2)
9. [Embeddings: OpenRouter](#embeddings-openrouter)
10. [Database Schema](#database-schema)
11. [Deployment](#deployment)
12. [Roadmap](#roadmap)
13. [Contributing](#contributing)

---

## Architecture

```
                        ┌─────────────────────────────────────────────┐
                        │            Next.js 16 (Vercel)               │
                        │                                               │
  Browser / Human ────► │  POST /api/upload                            │
                        │  GET  /s/[slug]/[...path]                    │
                        │  /dashboard                                   │
                        │                                               │
  AI Agent ──────────► │  POST /v1/agents          (create agent)     │
  (Bearer fv_sk_...)    │  GET  /v1/files           (list files)       │
                        │  POST /v1/files           (upload + index)   │
                        │  GET  /v1/files/:id       (file metadata)    │
                        │  DELETE /v1/files/:id     (delete file)      │
                        │  POST /v1/files/:id/index (index on demand)  │
                        │  POST /v1/search          (semantic search)  │
                        │  POST /v1/memory          (store memory)     │
                        │  GET  /v1/memory          (recall memory)    │
                        └────────────┬────────────────┬───────────────┘
                                     │                │
                              Prisma (libsql)    Cloudflare R2
                              SQLite / Turso     (object storage)
                                     │
                         ┌───────────┴────────────┐
                         │  Embedding pipeline     │
                         │  (on index=true)        │
                         │                         │
                         │  extract text           │
                         │  → chunk (500w/100w)    │
                         │  → embed (OpenRouter)   │
                         │  → store vector         │
                         └─────────────────────────┘
```

### Subdomain routing

`*.filevault.host` → Next.js middleware rewrites to `/s/<slug>` before the request hits any route handler. Custom domains (CNAME → filevault.host) are resolved by `/api/domain`.

---

## Tech Stack

| Layer | Library |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 + CSS custom properties |
| Animations | Framer Motion 12 |
| Auth (human) | Clerk v7 (optional) |
| Auth (agent) | SHA-256 hashed API keys (`fv_sk_` prefix) |
| ORM | Prisma 7 with `@prisma/adapter-libsql` |
| Database | SQLite / Turso (libsql) |
| Object storage | Cloudflare R2 (S3-compatible via `@aws-sdk/client-s3`) |
| Embeddings | OpenRouter → `openai/text-embedding-3-small` (1536 dims) |
| Text extraction | HTML (regex), TXT, PDF (pdf-parse) |
| ZIP extraction | JSZip |
| Password hashing | bcryptjs |
| Validation | Zod 4 |
| Data fetching | SWR |

---

## Project Structure

```
FileVault/
├── prisma/
│   ├── schema.prisma              # All models
│   └── migrations/
├── src/
│   ├── proxy.ts                   # Middleware: subdomain rewrite + Clerk auth
│   ├── app/
│   │   ├── api/
│   │   │   ├── upload/            # POST — human upload
│   │   │   ├── files/             # GET / PATCH / DELETE — human dashboard
│   │   │   ├── domain/            # GET — custom domain resolution
│   │   │   ├── analytics/         # GET — per-site view stats
│   │   │   ├── cron/cleanup/      # GET — expired site cleanup
│   │   │   └── v1/
│   │   │       ├── agents/        # POST — create agent + API key
│   │   │       ├── files/         # POST — agent file upload + indexing
│   │   │       ├── search/        # POST — semantic search
│   │   │       └── memory/        # POST / GET — store + recall memory
│   │   ├── s/[slug]/[...path]/    # File serving + password gate
│   │   ├── dashboard/             # User dashboard
│   │   └── (auth)/sign-in|up/
│   ├── components/
│   │   ├── landing/               # Hero, Features, HowItWorks, Testimonials
│   │   ├── dashboard/             # FileCard, FileGrid, dialogs
│   │   ├── upload/                # DropZone, UploadProgress, UploadSuccess
│   │   ├── layout/                # Navbar, Footer
│   │   └── ui/                    # Button, Input, Badge, Card, Dialog
│   ├── hooks/                     # useUpload, useFiles, useClipboard
│   └── lib/
│       ├── auth/apiKey.ts         # Key generation, hashing, request resolution
│       ├── embeddings/            # generateEmbedding() via OpenRouter
│       ├── chunking/              # chunkText() — sliding window
│       ├── extractors/            # extractText() — HTML / TXT / PDF
│       ├── search/similarity.ts   # cosineSimilarity(), rankResults()
│       ├── storage/               # StorageDriver interface + local + R2 drivers
│       ├── prisma.ts
│       ├── limits.ts              # Tier config (anon / free / pro)
│       ├── slug.ts
│       ├── unzip.ts
│       ├── mime.ts
│       ├── hash.ts
│       ├── analytics.ts
│       └── validations.ts
```

---

## Local Development

### Prerequisites

- Node.js 20+
- SQLite (`sqlite3` CLI for applying migrations manually)

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

Minimum for local dev (no Clerk, no R2 — uses local filesystem + SQLite):

```env
DATABASE_URL="file:./prisma/filevault.db"
DIRECT_URL="file:./prisma/filevault.db"
NEXT_PUBLIC_BASE_URL="http://localhost:3001"
NEXT_PUBLIC_BASE_DOMAIN="localhost"
CRON_SECRET="dev-cron-secret"

# Agent API (AI features)
OPENROUTER_API_KEY="sk-or-v1-..."
```

### 3. Apply migrations

```bash
sqlite3 prisma/filevault.db < prisma/migrations/20260501091619_init_sqlite/migration.sql
sqlite3 prisma/filevault.db < prisma/migrations/20260502123130_add_anon_upload_log/migration.sql
sqlite3 prisma/filevault.db < prisma/migrations/20260503000000_add_custom_domain/migration.sql
sqlite3 prisma/filevault.db < prisma/migrations/20260504000000_add_agent_system/migration.sql
npx prisma generate
```

### 4. Start dev server

```bash
node node_modules/next/dist/bin/next dev
```

> **Note:** Due to a Next.js 16 binary packaging quirk, `npx next dev` may fail with MODULE_NOT_FOUND on some Node versions. Use the full path above.

Open [http://localhost:3001](http://localhost:3001).

---

## Environment Variables

### Database

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✓ | libsql connection string. `file:./prisma/filevault.db` locally. |
| `DIRECT_URL` | ✓ | Direct (non-pooled) connection. Same as DATABASE_URL for SQLite. |

### Storage

| Variable | Required | Description |
|---|---|---|
| `STORAGE_DRIVER` | — | `local` (default) or `r2` |
| `UPLOADS_PATH` | — | Local uploads dir. Defaults to `./uploads`. |
| `R2_ACCOUNT_ID` | R2 only | Cloudflare account ID |
| `R2_ACCESS_KEY_ID` | R2 only | R2 S3-compatible access key |
| `R2_SECRET_ACCESS_KEY` | R2 only | R2 S3-compatible secret key |
| `R2_BUCKET_NAME` | R2 only | R2 bucket name |
| `R2_PUBLIC_URL` | R2 only | Public CDN base URL, e.g. `https://pub-xxx.r2.dev` |

### AI / Embeddings

| Variable | Required | Description |
|---|---|---|
| `OPENROUTER_API_KEY` | For indexing/search | OpenRouter API key for `text-embedding-3-small` |

### Application

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_BASE_URL` | ✓ | Public base URL without trailing slash |
| `NEXT_PUBLIC_BASE_DOMAIN` | — | Base domain. Default: `filevault.host` |
| `CRON_SECRET` | ✓ | Authorises `GET /api/cron/cleanup` |

### Auth — Clerk (optional)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | App works without this (anonymous mode) |
| `CLERK_SECRET_KEY` | Required if publishable key is set |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Default: `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Default: `/sign-up` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | Default: `/dashboard` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | Default: `/dashboard` |

---

## Web Hosting Features

| Feature | Anonymous | Free | Pro |
|---|:---:|:---:|:---:|
| Upload ZIP or HTML | ✓ | ✓ | ✓ |
| Max upload size | 5 MB | 10 MB | 100 MB |
| Link expiry | 24 h | 30 days | Never |
| Daily uploads | 3/IP | — | — |
| Max active links | — | 10 | Unlimited |
| Password protection | — | ✓ | ✓ |
| Custom link name | — | ✓ | ✓ |
| Custom domain (CNAME) | — | — | ✓ |
| View analytics | — | ✓ | ✓ |
| QR code | — | ✓ | ✓ |
| Dashboard | — | ✓ | ✓ |

### Human API endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/upload` | Upload + deploy a file |
| `GET` | `/api/files` | List user's deployments |
| `PATCH` | `/api/files/[slug]` | Rename, set password, update expiry |
| `PUT` | `/api/files/[slug]` | Replace files at same URL |
| `DELETE` | `/api/files/[slug]` | Delete deployment |
| `GET` | `/api/analytics/[slug]` | View stats |
| `GET` | `/api/cron/cleanup` | Delete expired sites (cron) |

---

## Agent API (v1)

The v1 API is designed for AI agents. Every endpoint requires a `fv_sk_` API key.

### Authentication

```
Authorization: Bearer fv_sk_<64 hex chars>
```

Keys are generated once at agent creation. Only a SHA-256 hash is stored — the plaintext is never recoverable. If a key is lost, create a new agent.

---

### POST /v1/agents

Create an agent and receive its API key.

**Request:**
```json
{ "name": "my-agent" }
```

**Response `201`:**
```json
{
  "agent_id": "clx...",
  "name": "my-agent",
  "api_key": "fv_sk_a1b2c3...",
  "created_at": "2026-05-04T00:00:00.000Z"
}
```

> `api_key` is shown **exactly once**. Store it immediately.

---

### GET /v1/files

List the agent's uploaded files, newest first.

**Query params:**

| Param | Default | Description |
|---|---|---|
| `limit` | `20` | Max results (1–100) |
| `cursor` | — | File ID for cursor-based pagination |
| `indexed` | — | `true` or `false` to filter by index status |

**Response `200`:**
```json
{
  "files": [
    {
      "file_id": "clx...",
      "name": "report.pdf",
      "mime_type": "application/pdf",
      "size_bytes": 204800,
      "is_indexed": true,
      "metadata": { "project": "q3" },
      "url": "https://pub-xxx.r2.dev/agents/.../report.pdf",
      "created_at": "2026-05-04T00:00:00.000Z"
    }
  ],
  "next_cursor": "clx..."
}
```

---

### POST /v1/files

Upload a file. Optionally index it for semantic search.

**Rate limit:** 20 uploads/minute per agent. Returns `429` with `Retry-After: 60` when exceeded.

**Request:** `multipart/form-data`

| Field | Type | Description |
|---|---|---|
| `file` | File | Any file type |
| `metadata` | string | Optional JSON string — arbitrary key/value pairs |
| `index` | string | `"true"` to extract text, chunk, embed, and store for search |

**Response `201`:** Same shape as a single item from `GET /v1/files`.

**Indexing pipeline** (when `index=true`):
1. Extract text — HTML stripping, plain text, or PDF parse
2. Chunk into 500-word windows with 100-word overlap
3. Embed each chunk via `openai/text-embedding-3-small` (OpenRouter)
4. Store chunk + vector in `embeddings` table

---

### GET /v1/files/:id

Fetch metadata for a single file.

**Response `200`:** Single file object (same shape as list item). Returns `404` if not found or not owned by agent.

---

### DELETE /v1/files/:id

Delete a file, all its embeddings, and its storage object.

**Response `204`** on success. Returns `404` if not found or not owned by agent.

---

### POST /v1/files/:id/index

Index an already-uploaded file. Useful when `index=false` was used at upload time.

**Response `200`:**
```json
{
  "file_id": "clx...",
  "indexed": true,
  "chunks_created": 12
}
```

Returns `{ "already_indexed": true }` if the file was already indexed.

---

### POST /v1/search

Semantic search across file embeddings and memory.

**Request:**
```json
{
  "query": "quarterly revenue breakdown",
  "filter": {
    "type": "all",
    "file_id": "clx..."
  },
  "limit": 5
}
```

| Field | Type | Default | Description |
|---|---|---|---|
| `query` | string | required | Natural language query |
| `filter.type` | `files` \| `memory` \| `all` | `all` | Scope the search |
| `filter.file_id` | string | — | Restrict to one file's chunks |
| `limit` | number | `5` | Max results (1–20) |

**Response `200`:**
```json
{
  "query": "quarterly revenue breakdown",
  "results": [
    {
      "id": "clx...",
      "type": "file",
      "content": "Q3 revenue reached $4.2M, up 18% from Q2...",
      "score": 0.8912,
      "file_id": "clx...",
      "url": "https://pub-xxx.r2.dev/..."
    },
    {
      "id": "clx...",
      "type": "memory",
      "content": "User confirmed target is 20% YoY growth.",
      "score": 0.7341
    }
  ]
}
```

Results from files and memory are merged and ranked by cosine similarity.

---

### POST /v1/memory

Store a memory with an embedding.

**Request:**
```json
{
  "content": "The user prefers concise bullet-point responses.",
  "ttl": 86400
}
```

| Field | Type | Description |
|---|---|---|
| `content` | string | Text to store (max 10 000 chars) |
| `ttl` | number | Optional TTL in seconds. Omit for permanent. |

**Response `201`:**
```json
{
  "memory_id": "clx...",
  "content": "The user prefers concise bullet-point responses.",
  "expires_at": "2026-05-05T00:00:00.000Z",
  "created_at": "2026-05-04T00:00:00.000Z"
}
```

---

### GET /v1/memory

List stored memories (paginated, newest first).

**Query params:** `limit` (default 20, max 100), `cursor` (memory ID for pagination)

**Response `200`:**
```json
{
  "memories": [
    { "memory_id": "clx...", "content": "...", "expires_at": null, "created_at": "..." }
  ],
  "next_cursor": "clx..."
}
```

---

## Storage: Cloudflare R2

Set `STORAGE_DRIVER=r2` plus the five R2 env vars to switch from local filesystem to R2.

Files are stored as `{slug}/{filename}` objects. The `storageKey` for each file is the full CDN URL (`https://pub-xxx.r2.dev/{slug}/{filename}`). The file-serving route detects any `storageKey` starting with `https://` and 302-redirects to R2 directly, so serving never passes through the Next.js function.

To set up R2:
1. [dash.cloudflare.com](https://dash.cloudflare.com) → **R2 Object Storage** → create a bucket
2. **Settings → Public Development URL** → Enable
3. **Manage R2 API tokens** → Create Account API Token (Object Read & Write)

---

## Embeddings: OpenRouter

Embeddings use `openai/text-embedding-3-small` via [OpenRouter](https://openrouter.ai) (1536 dimensions). The OpenAI SDK points at `https://openrouter.ai/api/v1`.

To get an API key: [openrouter.ai/keys](https://openrouter.ai/keys).

The provider is abstracted behind `src/lib/embeddings/index.ts`. Swapping to a different provider (Cohere, Jina, etc.) requires changing only that file.

---

## Database Schema

```
agents           — AI agent identities (API key hash, name)
agent_files      — Files uploaded via the agent API
embeddings       — Text chunks + embedding vectors (for files and memory)
memories         — Agent memory entries + embedding vectors
sites            — Human-deployed static sites
site_files       — Individual files within a site
site_views       — Per-request analytics records
anon_upload_logs — IP-based rate limiting for anonymous uploads
```

Full schema: [`prisma/schema.prisma`](prisma/schema.prisma)

---

## Deployment

### Vercel (recommended)

1. Import the GitHub repo into Vercel
2. Set all environment variables in **Project → Settings → Environment Variables**
3. Add `STORAGE_DRIVER=r2` and the five R2 vars
4. Add `OPENROUTER_API_KEY`
5. Deploy — migrations run automatically via `prisma generate && next build`

### Railway

1. **Deploy from GitHub repo** → Railway auto-detects `railway.json`
2. **Volumes → Add Volume**, mount at `/app/uploads`
3. Set `DATABASE_URL=file:/app/uploads/filevault.db`, `UPLOADS_PATH=/app/uploads`
4. Add all other env vars

---

## Roadmap

### Near-term (v0.2)

- [x] `GET /v1/files` — list agent's files with pagination + indexed filter
- [x] `GET /v1/files/:id` — single file metadata
- [x] `DELETE /v1/files/:id` — delete file, embeddings, and storage object
- [x] `POST /v1/files/:id/index` — index an already-uploaded file on demand
- [x] Per-agent rate limiting — 20 uploads/min, `Retry-After` header on 429
- [ ] Agent dashboard UI — web interface to manage agents, browse files, run searches

### Mid-term (v0.3)

- [ ] **Usage metering** — track embedding token spend and API request counts per agent
- [ ] **Webhook support** — POST to a URL when async indexing completes
- [ ] **Metadata filtering** in search — filter by arbitrary JSON metadata fields
- [ ] **Batch file upload** — upload multiple files in one request
- [ ] **TypeScript SDK** — `npm install @filevault/sdk`

### Longer-term (v1.0)

- [ ] **pgvector migration** — move from in-memory cosine similarity to Postgres pgvector for scale
- [ ] **Python SDK** — `pip install filevault`
- [ ] **Agent-to-agent sharing** — grant another agent read access to your files/memory
- [ ] **Streaming search** — stream results as embeddings are scored
- [ ] **Re-ranking** — optional cross-encoder re-ranking pass for higher precision
- [ ] **Collections** — group files into named collections for scoped search
- [ ] **Billing for agent API** — usage-based pricing per 1K embeddings / searches

---

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Build to verify: `node node_modules/next/dist/bin/next build`
4. Open a PR with a clear description of the change

---

## License

MIT — see [LICENSE](LICENSE) for details.

---

<p align="center">
  Built with <a href="https://nextjs.org">Next.js</a> · <a href="https://prisma.io">Prisma</a> · <a href="https://www.cloudflare.com/developer-platform/r2/">Cloudflare R2</a> · <a href="https://openrouter.ai">OpenRouter</a> · <a href="https://clerk.com">Clerk</a>
</p>
