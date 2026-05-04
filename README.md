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
| **Agent Storage API** | AI agents & developers | REST API with API-key auth, file storage, semantic search, memory, collections, and sharing |

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
   - [Usage Caps](#usage-caps)
   - [POST /v1/agents](#post-v1agents)
   - [GET /v1/agents/me](#get-v1agentsme)
   - [GET /v1/files](#get-v1files)
   - [POST /v1/files](#post-v1files)
   - [POST /v1/files/batch](#post-v1filesbatch)
   - [GET /v1/files/:id](#get-v1filesid)
   - [DELETE /v1/files/:id](#delete-v1filesid)
   - [POST /v1/files/:id/index](#post-v1filesidindex)
   - [POST /v1/search](#post-v1search)
   - [POST /v1/memory](#post-v1memory)
   - [GET /v1/memory](#get-v1memory)
   - [GET /v1/usage](#get-v1usage)
   - [Webhooks](#webhooks)
   - [Collections](#collections)
   - [Sharing](#sharing)
8. [Storage: Cloudflare R2](#storage-cloudflare-r2)
9. [Embeddings: OpenRouter](#embeddings-openrouter)
10. [Database Schema](#database-schema)
11. [Deployment](#deployment)
12. [Roadmap](#roadmap)
13. [Contributing](#contributing)

---

## Architecture

```
                        ┌─────────────────────────────────────────────────┐
                        │              Next.js 16 (Vercel)                 │
                        │                                                   │
  Browser / Human ────► │  POST /api/upload                                │
                        │  GET  /s/[slug]/[...path]                        │
                        │  /dashboard                                       │
                        │                                                   │
  AI Agent ──────────► │  POST   /v1/agents            (create agent)     │
  (Bearer fv_sk_...)    │  GET    /v1/agents/me         (agent identity)   │
                        │  GET    /v1/files             (list files)       │
                        │  POST   /v1/files             (upload + index)   │
                        │  POST   /v1/files/batch       (batch upload)     │
                        │  GET    /v1/files/:id         (file metadata)    │
                        │  DELETE /v1/files/:id         (delete file)      │
                        │  POST   /v1/files/:id/index   (index on demand)  │
                        │  POST   /v1/search            (semantic search)  │
                        │  POST   /v1/memory            (store memory)     │
                        │  GET    /v1/memory            (list memories)    │
                        │  GET    /v1/usage             (metrics)          │
                        │  GET/PUT/DELETE /v1/webhooks  (webhook config)   │
                        │  GET/POST /v1/collections     (manage groups)    │
                        │  GET/DELETE /v1/collections/:id                  │
                        │  POST/DELETE /v1/collections/:id/files           │
                        │  GET/POST /v1/shares          (agent sharing)    │
                        │  DELETE /v1/shares/:granteeId                    │
                        └────────────┬──────────────────┬─────────────────┘
                                     │                  │
                              Prisma (libsql)      Cloudflare R2
                              SQLite / Turso        (object storage)
                                     │
                         ┌───────────┴──────────────┐
                         │  Embedding pipeline       │
                         │  (on index=true)          │
                         │                           │
                         │  extract text             │
                         │  → chunk (500w/100w)      │
                         │  → embed (OpenRouter)     │
                         │  → store vector           │
                         └───────────────────────────┘
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
| Text extraction | HTML (custom parser), TXT, PDF (pdf-parse) |
| ZIP extraction | JSZip |
| Password hashing | bcryptjs |
| Validation | Zod 4 |
| Data fetching | SWR |
| Testing | Vitest |

---

## Project Structure

```
FileVault/
├── prisma/
│   ├── schema.prisma              # All models
│   └── migrations/
├── sdk/
│   └── python/                    # Zero-dependency Python SDK (filevault.py)
├── src/
│   ├── proxy.ts                   # Middleware: subdomain rewrite + Clerk auth
│   ├── __tests__/                 # Vitest unit tests
│   ├── app/
│   │   ├── api/
│   │   │   ├── upload/            # POST — human upload
│   │   │   ├── files/             # GET / PATCH / DELETE — human dashboard
│   │   │   ├── domain/            # GET — custom domain resolution
│   │   │   ├── analytics/         # GET — per-site view stats
│   │   │   ├── cron/cleanup/      # GET — expired site cleanup
│   │   │   └── v1/
│   │   │       ├── agents/        # POST create agent; GET /me identity
│   │   │       ├── files/         # Upload, list, get, delete, index, batch
│   │   │       ├── search/        # POST — semantic search
│   │   │       ├── memory/        # POST / GET — store + recall memory
│   │   │       ├── usage/         # GET — storage and activity metrics
│   │   │       ├── webhooks/      # GET / PUT / DELETE — webhook config
│   │   │       ├── collections/   # CRUD for file groups
│   │   │       └── shares/        # Agent-to-agent read access
│   │   ├── s/[slug]/[...path]/    # File serving + password gate
│   │   ├── agents/                # Agent dashboard UI
│   │   ├── dashboard/             # User dashboard
│   │   └── (auth)/sign-in|up/
│   ├── components/
│   │   ├── landing/               # Hero, Features, HowItWorks, Testimonials
│   │   ├── agents/                # AgentSetup, AgentDashboard, AgentSearch, AgentMemory
│   │   ├── dashboard/             # FileCard, FileGrid, dialogs
│   │   ├── upload/                # DropZone, UploadProgress, UploadSuccess
│   │   ├── layout/                # Navbar, Footer
│   │   └── ui/                    # Button, Input, Badge, Card, Dialog
│   ├── hooks/                     # useUpload, useFiles, useAgentFiles, useAgentMemory
│   ├── sdk/
│   │   └── index.ts               # TypeScript SDK — FileVault class
│   └── lib/
│       ├── auth/apiKey.ts         # Key generation, hashing, request resolution
│       ├── agentLimits.ts         # Per-agent hard caps (files, storage, embeddings, memory)
│       ├── embeddings/            # generateEmbedding() via OpenRouter
│       ├── chunking/              # chunkText() — sliding window
│       ├── extractors/            # extractText() — HTML / TXT / PDF / JSON
│       ├── search/similarity.ts   # cosineSimilarity(), rankResults()
│       ├── storage/               # StorageDriver interface + local + R2 drivers
│       ├── indexing.ts            # indexFile(), streamToBuffer()
│       ├── webhook.ts             # fireWebhook() — non-blocking, SSRF-safe
│       ├── rateLimit.ts           # checkUploadRateLimit() — 20 uploads/min
│       ├── logger.ts              # JSON-structured logger
│       ├── prisma.ts
│       ├── limits.ts              # Tier config (anon / free / pro)
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
sqlite3 prisma/filevault.db < prisma/migrations/20260504000001_collections_and_shares/migration.sql
npx prisma generate
```

### 4. Start dev server

```bash
node node_modules/next/dist/bin/next dev
```

> **Note:** Due to a Next.js 16 binary packaging quirk, `npx next dev` may fail with MODULE_NOT_FOUND on some Node versions. Use the full path above.

Open [http://localhost:3001](http://localhost:3001).

### 5. Run tests

```bash
npm test
```

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

### Usage Caps

The following hard limits apply per agent to prevent runaway storage and embedding costs:

| Resource | Limit |
|---|---|
| Files | 1,000 |
| Total storage | 1 GB |
| Embedding chunks | 50,000 |
| Active memories | 5,000 |
| File size (single) | 50 MB |
| Batch size | 10 files |

All limits return `429` with a descriptive `error` field when exceeded.

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

### GET /v1/agents/me

Return the current agent's identity. Useful for exchanging agent IDs with other agents before setting up a share.

**Response `200`:**
```json
{
  "agent_id": "clx...",
  "name": "my-agent",
  "created_at": "2026-05-04T00:00:00.000Z"
}
```

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
| `file` | File | Any file type. Max 50 MB. |
| `metadata` | string | Optional JSON string — arbitrary key/value pairs |
| `index` | string | `"true"` to extract text, chunk, embed, and store for search |

**Response `201`:** Same shape as a single item from `GET /v1/files`.

**Indexing pipeline** (when `index=true`):
1. Extract text — HTML stripping, plain text, PDF parse, or JSON formatting
2. Chunk into 500-word windows with 100-word overlap
3. Embed each chunk via `openai/text-embedding-3-small` (OpenRouter)
4. Store chunk + vector in `embeddings` table

---

### POST /v1/files/batch

Upload up to 10 files in a single request.

**Rate limit:** Same 20 uploads/minute window as single upload.

**Request:** `multipart/form-data`

| Field | Type | Description |
|---|---|---|
| `files` | File[] | Up to 10 files. Each max 50 MB. |
| `metadata` | string | Optional shared JSON metadata for all files |
| `index` | string | `"true"` to index all files |

**Response:** `201` (all succeeded), `207` (partial success), or `500` (all failed).

```json
{
  "files": [
    { "file_id": "clx...", "name": "a.pdf", "size_bytes": 1024, "is_indexed": true, "url": "..." },
    { "file_id": "",       "name": "b.bin", "size_bytes": 0,    "is_indexed": false, "url": "", "error": "File too large." }
  ]
}
```

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

Semantic search across file embeddings and/or memory.

**Request:**
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

| Field | Type | Default | Description |
|---|---|---|---|
| `query` | string | required | Natural language query |
| `filter.type` | `files` \| `memory` \| `all` | `all` | Scope the search |
| `filter.file_id` | string | — | Restrict to one file's chunks |
| `filter.collection_id` | string | — | Restrict to files in a collection |
| `filter.include_shared` | boolean | `false` | Also search files from agents who shared with you |
| `filter.metadata` | object | — | Filter file embeddings by metadata key/value pairs |
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

Results from files and memory are merged and ranked by cosine similarity. Shared-agent memories are never included even when `include_shared: true`.

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

### GET /v1/usage

Return storage and activity metrics for the agent.

**Response `200`:**
```json
{
  "files": { "count": 42, "indexed": 38, "storage_bytes": 10485760 },
  "embeddings": { "count": 1204 },
  "memory": { "count": 17 }
}
```

---

### Webhooks

Register a URL to receive event notifications.

| Method | Path | Description |
|---|---|---|
| `GET` | `/v1/webhooks` | Get current webhook URL |
| `PUT` | `/v1/webhooks` | Set webhook URL `{ "url": "https://..." }` |
| `DELETE` | `/v1/webhooks` | Remove webhook |

**Events fired:**

| Event | Trigger |
|---|---|
| `file.created` | After a successful upload |
| `file.deleted` | After a file is deleted |
| `file.indexed` | After on-demand indexing completes |
| `memory.created` | After a memory is stored |

**Payload shape:**
```json
{
  "event": "file.created",
  "data": { "file_id": "clx...", "name": "report.pdf", "size_bytes": 204800, "is_indexed": true },
  "timestamp": "2026-05-04T00:00:00.000Z"
}
```

Delivery is non-blocking with a 5 s timeout. Private/loopback URLs are rejected silently (SSRF protection).

---

### Collections

Group files into named collections for scoped search.

| Method | Path | Description |
|---|---|---|
| `GET` | `/v1/collections` | List collections with file counts |
| `POST` | `/v1/collections` | Create a collection `{ "name": "..." }` |
| `GET` | `/v1/collections/:id` | Get collection with its file list |
| `DELETE` | `/v1/collections/:id` | Delete collection (files are not deleted) |
| `POST` | `/v1/collections/:id/files` | Add a file `{ "file_id": "..." }` (idempotent) |
| `DELETE` | `/v1/collections/:id/files/:fileId` | Remove a file from the collection |

**Create response `201`:**
```json
{ "collection_id": "clx...", "name": "Q3 Reports", "file_count": 0, "created_at": "..." }
```

To search within a collection, pass `filter.collection_id` to `POST /v1/search`.

---

### Sharing

Grant another agent read access to your file embeddings.

| Method | Path | Description |
|---|---|---|
| `GET` | `/v1/shares` | List shares given and received |
| `POST` | `/v1/shares` | Grant access `{ "agent_id": "clx..." }` |
| `DELETE` | `/v1/shares/:granteeId` | Revoke access |

To find your `agent_id` to give to other agents: `GET /v1/agents/me`.

**GET response `200`:**
```json
{
  "given":    [{ "share_id": "clx...", "grantee_agent_id": "clx...", "created_at": "..." }],
  "received": [{ "share_id": "clx...", "owner_agent_id":   "clx...", "created_at": "..." }]
}
```

Once a share is active, the grantee can pass `filter.include_shared: true` in `POST /v1/search` to include the owner's file embeddings in results. Memories are never shared.

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
agents            — AI agent identities (API key hash, name, webhook URL)
agent_files       — Files uploaded via the agent API
embeddings        — Text chunks + embedding vectors (for files and memory)
memories          — Agent memory entries + embedding vectors
collections       — Named file groups per agent
collection_files  — Join table: (collectionId, fileId)
agent_shares      — Read access grants between agents
sites             — Human-deployed static sites
site_files        — Individual files within a site
site_views        — Per-request analytics records
anon_upload_logs  — IP-based rate limiting for anonymous uploads
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

### v0.2 ✅

- [x] `GET /v1/files` — list agent's files with pagination + indexed filter
- [x] `GET /v1/files/:id` — single file metadata
- [x] `DELETE /v1/files/:id` — delete file, embeddings, and storage object
- [x] `POST /v1/files/:id/index` — index an already-uploaded file on demand
- [x] Per-agent rate limiting — 20 uploads/min, `Retry-After` header on 429
- [x] Agent dashboard UI — `/agents` page with file management, semantic search, and memory

### v0.3 ✅

- [x] **Usage metering** — `GET /v1/usage` returns file count, indexed count, storage bytes, memory count
- [x] **Webhook support** — `PUT /v1/webhooks` registers a URL; fires on `file.created`, `file.deleted`, `memory.created`
- [x] **Metadata filtering** in search — `filter.metadata: {key: value}` in `POST /v1/search`
- [x] **Batch file upload** — `POST /v1/files/batch` accepts up to 10 files in one request
- [x] **TypeScript SDK** — `src/sdk/index.ts` with full API coverage (`FileVault` class)

### v1.0 ✅

- [x] **Python SDK** — `sdk/python/filevault.py` — zero-dependency client for Python 3.9+
- [x] **Collections** — group files into named collections for scoped search
- [x] **Agent-to-agent sharing** — grant another agent read access to your file embeddings
- [x] **Usage caps** — per-agent hard limits (files, storage, embeddings, memory) to prevent runaway costs
- [x] **Security hardening** — file size limit (50 MB), SSRF protection on webhooks
- [x] **Tests** — Vitest unit tests for similarity, chunking, extractors, webhooks, and limits
- [x] **CI** — GitHub Actions: typecheck + lint + test on every push and PR
- [x] **Structured logging** — JSON logger wired into indexing and webhook delivery

### v1.1

- [ ] **Streaming search** — stream results as embeddings are scored
- [ ] **Re-ranking** — optional cross-encoder re-ranking pass for higher precision
- [ ] **pgvector migration** — move from in-memory cosine similarity to Postgres pgvector for scale
- [ ] **Billing for agent API** — usage-based pricing per 1K embeddings / searches

---

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Run tests: `npm test`
4. Typecheck: `node node_modules/typescript/lib/tsc.js --noEmit`
5. Open a PR with a clear description of the change

---

## License

MIT — see [LICENSE](LICENSE) for details.

---

<p align="center">
  Built with <a href="https://nextjs.org">Next.js</a> · <a href="https://prisma.io">Prisma</a> · <a href="https://www.cloudflare.com/developer-platform/r2/">Cloudflare R2</a> · <a href="https://openrouter.ai">OpenRouter</a> · <a href="https://clerk.com">Clerk</a>
</p>
