@AGENTS.md

# FileVault — Claude context

Read this file before doing anything. It is the canonical snapshot of the project.
Skip file exploration for anything covered here — go straight to the relevant file.

---

## What this project is

Two products, one codebase:

| Product | Users | Entry point |
|---|---|---|
| Static file hosting | Humans via browser | `/` homepage → `/api/upload` |
| Agent Storage API | AI agents via REST | `/api/v1/*` with `fv_sk_` API keys |

---

## Dev server

```bash
node node_modules/next/dist/bin/next dev
```

`npx next dev` and `npm run dev` both fail with MODULE_NOT_FOUND on this Next.js 16 build. Always use the full path.

---

## Deployment

**Production: Vercel** — `filevault-five.vercel.app`
- GitHub integration auto-deploys on every push to `main`
- Serverless — no persistent filesystem, no memory limits, no start script needed
- Vercel does NOT run migrations automatically. Run them manually via Supabase SQL editor when schema changes

`railway.json` and `scripts/start.sh` remain in the repo but Railway is no longer the primary deployment target.

---

## Key files — go here first

| File | Purpose |
|---|---|
| `prisma/schema.prisma` | Single source of truth for all DB models |
| `prisma.config.ts` | Prisma 7 connection config — prefers `DIRECT_URL` over `DATABASE_URL` for migrations |
| `src/proxy.ts` | Middleware — subdomain rewrites + Clerk auth (NOT `middleware.ts`) |
| `src/lib/auth/apiKey.ts` | `generateApiKey()`, `hashApiKey()`, `resolveAgent(authHeader)` |
| `src/lib/prisma.ts` | Prisma client singleton — lazy proxy pattern with `@prisma/adapter-pg` |
| `src/lib/storage/index.ts` | `storageDriver` — always import from here, never from `local.ts` / `r2.ts` directly |
| `src/lib/storage/types.ts` | `StorageDriver` interface, `FileEntry` type |
| `src/lib/embeddings/index.ts` | `generateEmbedding(text)` → `number[]` via OpenRouter |
| `src/lib/chunking/index.ts` | `chunkText(text, chunkSize=500, overlap=100)` → `string[]` |
| `src/lib/extractors/index.ts` | `extractText(buffer, mimeType, filename)` → HTML/TXT/PDF/JSON |
| `src/lib/search/similarity.ts` | `cosineSimilarity(a, b)`, `rankResults(results, topK)` |
| `src/lib/indexing.ts` | `indexFile(agentId, fileId, buffer, mimeType, filename)` → `IndexResult`, `streamToBuffer(stream)` |
| `src/lib/rateLimit.ts` | `checkUploadRateLimit(agentId)` → `{ allowed, retryAfterSeconds }` — 20 uploads/min |
| `src/lib/webhook.ts` | `fireWebhook(agentId, payload)` — non-blocking POST to agent's webhookUrl |
| `src/sdk/index.ts` | TypeScript SDK — `FileVault` class wrapping all v1 endpoints |
| `src/hooks/useAgentFiles.ts` | SWR hook for v1/files — `deleteFile`, `indexFile`, `uploadFile` |
| `src/hooks/useAgentMemory.ts` | SWR hook for v1/memory — `addMemory` |
| `src/components/agents/` | `AgentSetup`, `AgentDashboard`, `AgentFileCard`, `AgentSearch`, `AgentMemory` |
| `src/app/agents/page.tsx` | `/agents` page — key stored in localStorage under `fv_agent_key` |
| `src/lib/limits.ts` | `getTier()`, `getLimits()`, `capExpiry()` — tier config |
| `src/lib/validations.ts` | Shared Zod schemas |
| `src/types/api.ts` | Shared TypeScript types for API responses |

---

## Database models (prisma/schema.prisma)

**Provider:** PostgreSQL (Supabase) with `pgvector` extension enabled.

**Human hosting:**
- `Site` — a deployed static site (slug, userId, passwordHash, expiresAt, customDomain, storagePrefix)
- `SiteFile` — individual file within a Site (path, mimeType, sizeBytes, storageKey)
- `SiteView` — analytics record per file request
- `AnonUploadLog` — IP-based rate limiting for anonymous uploads

**Agent system:**
- `Agent` — API key identity (apiKeyHash, name, webhookUrl nullable)
- `AgentFile` — file uploaded via agent API (agentId, storageKey, metadata JSON string, isIndexed)
- `Embedding` — text chunk + native pgvector column (agentId, fileId nullable, content, vector `vector(1536)`)
- `Memory` — agent memory entry (agentId, content, vector `vector(1536)`, expiresAt nullable)
- `Collection` — named group of files belonging to an agent
- `CollectionFile` — join table: (collectionId, fileId) composite PK
- `AgentShare` — grants read access from ownerAgentId to granteeAgentId (unique pair)

Vectors use native pgvector `Unsupported("vector(1536)")` in the schema. All vector queries use raw SQL with the `<=>` cosine distance operator — never try to read/write the vector column through Prisma's typed API.

`AgentFile.metadata` is stored as a JSON **string** — always `JSON.parse()` before returning.

---

## Full API surface

**Human API:**
| Method | Route | Description |
|---|---|---|
| `POST` | `/api/upload` | Upload + deploy (multipart) |
| `GET` | `/api/files` | List user's sites (paginated) |
| `PATCH` | `/api/files/[slug]` | Rename, password, expiry |
| `PUT` | `/api/files/[slug]` | Replace files at same URL |
| `DELETE` | `/api/files/[slug]` | Delete site + storage |
| `GET` | `/api/analytics/[slug]` | View stats |
| `GET` | `/api/domain` | Custom domain → slug resolution |
| `GET` | `/api/cron/cleanup` | Delete expired sites (cron) |

**Agent API (v1):**
| Method | Route | Description |
|---|---|---|
| `POST` | `/api/v1/agents` | Create agent, returns `fv_sk_` key once |
| `GET` | `/api/v1/files` | List files (paginated, `indexed` filter) |
| `POST` | `/api/v1/files` | Upload + optionally index file (rate limited: 20/min) |
| `GET` | `/api/v1/files/[id]` | Single file metadata |
| `DELETE` | `/api/v1/files/[id]` | Delete file + embeddings (cascade) + storage |
| `POST` | `/api/v1/files/[id]/index` | Index existing file on demand |
| `POST` | `/api/v1/files/batch` | Upload up to 10 files at once (rate limited) |
| `POST` | `/api/v1/search` | Semantic search — filters: `file_id`, `type`, `metadata`, `collection_id`, `include_shared` |
| `POST` | `/api/v1/memory` | Store a memory with embedding |
| `GET` | `/api/v1/memory` | List memories (paginated) |
| `GET` | `/api/v1/usage` | File count, indexed count, storage bytes, memory count |
| `GET` | `/api/v1/webhooks` | Get webhook URL |
| `PUT` | `/api/v1/webhooks` | Register/update webhook URL |
| `DELETE` | `/api/v1/webhooks` | Remove webhook |
| `GET` | `/api/v1/agents/me` | Current agent's id, name, created_at |
| `GET` | `/api/v1/collections` | List collections with file counts |
| `POST` | `/api/v1/collections` | Create a collection `{ name }` |
| `GET` | `/api/v1/collections/[id]` | Get collection with its files |
| `DELETE` | `/api/v1/collections/[id]` | Delete collection (files unaffected) |
| `POST` | `/api/v1/collections/[id]/files` | Add file to collection `{ file_id }` |
| `DELETE` | `/api/v1/collections/[id]/files/[fileId]` | Remove file from collection |
| `GET` | `/api/v1/shares` | List shares given and received |
| `POST` | `/api/v1/shares` | Grant read access to another agent `{ agent_id }` |
| `DELETE` | `/api/v1/shares/[granteeId]` | Revoke a share |

---

## Environment variables

```bash
# Database (PostgreSQL — Supabase)
DATABASE_URL   # Supabase connection pooler (port 6543, pgbouncer) — used at runtime
DIRECT_URL     # Supabase direct connection (port 5432) — used by prisma migrate deploy only

# Storage — production uses R2, local dev uses local disk
STORAGE_DRIVER        # "r2" in production, "local" for local dev
UPLOADS_PATH          # local only — defaults to ./uploads
R2_ACCOUNT_ID         # fd8b0a310ce4c92432537df62bcefbbf
R2_ACCESS_KEY_ID      # from Cloudflare R2 → Manage R2 API Tokens
R2_SECRET_ACCESS_KEY  # from Cloudflare R2 → Manage R2 API Tokens
R2_BUCKET_NAME        # filevault
R2_PUBLIC_URL         # https://pub-f641d19db8ee499bbce78fa8ab1c7e9e.r2.dev

# AI
OPENROUTER_API_KEY    # model: openai/text-embedding-3-small

# App
NEXT_PUBLIC_BASE_URL      # https://filevault-five.vercel.app in production
NEXT_PUBLIC_BASE_DOMAIN   # filevault.host
CRON_SECRET               # any random string

# Clerk (optional — app works without these)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
NEXT_PUBLIC_CLERK_SIGN_IN_URL       # /sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL       # /sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL # /dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL # /dashboard
```

---

## Patterns — follow these exactly

**Every v1 route starts with:**
```ts
import { resolveAgent } from '@/lib/auth/apiKey'

const agentId = await resolveAgent(request.headers.get('authorization'))
if (!agentId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
```

**Storage — always through the driver:**
```ts
import { storageDriver } from '@/lib/storage'
// Never: import { r2Driver } from '@/lib/storage/r2'
```

**Validation — always Zod:**
```ts
const result = MySchema.safeParse(body)
if (!result.success) return NextResponse.json({ error: result.error.flatten() }, { status: 400 })
```

**Prisma — always the singleton:**
```ts
import { prisma } from '@/lib/prisma'
```

**Vector queries — raw SQL only:**
```ts
// Insert: pass the embedding array as a bracketed string literal
const vectorLiteral = `[${embedding.join(',')}]`
await prisma.$executeRaw`INSERT INTO embeddings (vector, ...) VALUES (${vectorLiteral}::vector, ...)`

// Search: use pgvector <=> cosine distance operator
await prisma.$queryRaw`SELECT 1 - (vector <=> ${vectorLiteral}::vector) AS score FROM embeddings ORDER BY score DESC`
```

**Error responses:**
- `400` — bad input
- `401` — missing or invalid API key
- `404` — resource not found or doesn't belong to agent
- `500` — unexpected server error (log it, don't expose internals)

---

## Migrations

The DB is PostgreSQL (Supabase). Prisma 7 uses `prisma.config.ts` for connection config (not `schema.prisma` env vars).

**Vercel deploys do NOT run migrations automatically.** For schema changes:
1. Write the migration SQL in `prisma/migrations/<timestamp>_<name>/migration.sql`
2. Run it in the Supabase SQL editor, or via: `DIRECT_URL=<direct_url> node node_modules/.bin/prisma migrate deploy`
3. Run `npx prisma generate` locally to update the client

`prisma.config.ts` prefers `DIRECT_URL` over `DATABASE_URL` so migrations bypass the pgbouncer connection pooler (required for DDL statements).

---

## Quirks to remember

- Middleware is `src/proxy.ts`, not `middleware.ts`
- `AgentFile.metadata` is stored as a JSON **string** — `JSON.parse()` before returning
- Vectors use native pgvector `vector(1536)` — query with raw SQL `<=>` operator, never via Prisma typed fields
- The R2 file-serving route 302-redirects to the CDN URL — files never stream through Next.js
- Clerk is entirely optional; all `auth()` calls are wrapped in try/catch
- `src/lib/prisma.ts` uses a lazy Proxy so `DATABASE_URL` is not required at Next.js build time — client is created on first use
- `next.config.ts` has `output: 'standalone'` (added for Railway memory reduction, harmless on Vercel)

---

## README update rule

**Update `README.md` whenever:**
- A new API endpoint is added or removed
- A new environment variable is introduced
- The storage layer, embedding provider, or DB changes
- The tier system limits change
- A new library is added to the core stack
- Deployment instructions change

Keep the README accurate. It is the external-facing source of truth.
When updating, match the existing section structure — don't restructure, just update the relevant section.
